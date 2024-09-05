const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(express.json());

// Connessione al database MongoDB usando l'URL da variabile d'ambiente
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Login';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Schemas e Models
const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String
});

const ConversationSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    chatName: String, // Nome o identificativo della chat
    messages: [{ 
        text: String, 
        sender: String, 
        timestamp: { type: Date, default: Date.now } 
    }]
});

const UserModel = mongoose.model("users", UserSchema);
const ConversationModel = mongoose.model("conversations", ConversationSchema);

const JWT_SECRET = 'your_jwt_secret_key'; // Sostituisci con una chiave segreta sicura

// Middleware per autenticare il token JWT
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403); // Forbidden
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
};

// Registrazione
app.post("/api/auth/register",
    body('email').isEmail().withMessage('Email non valida'),
    body('password').isLength({ min: 6 }).withMessage('La password deve essere lunga almeno 6 caratteri'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Utente già registrato" });
            }
            const hashedPassword = await bcrypt.hash(password, 10); // Crittografa la password
            const newUser = new UserModel({ email, password: hashedPassword });
            await newUser.save();
            res.json({ message: "Registrazione avvenuta con successo" });
        } catch (error) {
            res.status(500).json({ message: "Errore del server" });
        }
    }
);

// Login
app.post("/api/auth/login",
    body('email').isEmail().withMessage('Email non valida'),
    body('password').notEmpty().withMessage('La password è obbligatoria'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            const user = await UserModel.findOne({ email });
            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    // Genera un token JWT
                    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
                    res.json({ message: "Login successo", token });
                } else {
                    res.status(400).json({ message: "Password errata" });
                }
            } else {
                res.status(400).json({ message: "Utente non esistente" });
            }
        } catch (error) {
            res.status(500).json({ message: "Errore del server" });
        }
    }
);

// Creazione di una nuova conversazione con messaggio iniziale
app.post('/api/conversations', authenticateJWT, async (req, res) => {
    const { chatName, message } = req.body;
    try {
        let conversation = await ConversationModel.findOne({ userId: req.user.userId, chatName });
        
        if (!conversation) {
            // Se la conversazione non esiste, creala con il messaggio iniziale
            conversation = new ConversationModel({
                userId: req.user.userId,
                chatName: chatName,
                messages: message ? [message] : []
            });
        } else if (message) {
            // Se esiste già, aggiungi solo il nuovo messaggio
            conversation.messages.push(message);
        }

        await conversation.save();
        res.json(conversation); // Ritorna la conversazione aggiornata
    } catch (error) {
        res.status(500).json({ message: 'Errore del server durante la creazione della conversazione' });
    }
});

// Visualizzazione di tutte le conversazioni dell'utente autenticato
app.get('/api/conversations', authenticateJWT, async (req, res) => {
    try {
        const conversations = await ConversationModel.find({ userId: req.user.userId });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Errore del server' });
    }
});

// Aggiunta di un messaggio a una conversazione specifica
app.post('/api/conversations/:id/messages', authenticateJWT, async (req, res) => {
    const { text, sender } = req.body;
    try {
        const conversation = await ConversationModel.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversazione non trovata' });
        }

        // Verifica se l'ultimo messaggio è già identico
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        if (lastMessage && lastMessage.text === text && lastMessage.sender === sender) {
            return res.status(400).json({ message: 'Messaggio duplicato, non aggiunto' });
        }

        // Aggiungi il nuovo messaggio alla conversazione
        conversation.messages.push({ text, sender });
        await conversation.save();

        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Errore del server' });
    }
});

// Eliminazione di una specifica conversazione
app.delete('/api/conversations/:id', authenticateJWT, async (req, res) => {
    try {
        const conversation = await ConversationModel.findOneAndDelete({
            userId: req.user.userId,
            _id: req.params.id
        });

        if (conversation) {
            res.json({ message: 'Conversazione eliminata con successo' });
        } else {
            res.status(404).json({ message: 'Conversazione non trovata' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Errore del server' });
    }
});

// Visualizzazione dei dettagli dell'utente autenticato
app.get('/api/user', authenticateJWT, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Errore del server' });
    }
});

// Aggiornamento delle informazioni dell'utente autenticato
app.put('/api/user', authenticateJWT, async (req, res) => {
    const { email, password } = req.body;
    try {
        const updates = {};
        if (email) updates.email = email;
        if (password) updates.password = await bcrypt.hash(password, 10);

        const user = await UserModel.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Errore del server' });
    }
});

// Eliminazione dell'utente autenticato
app.delete('/api/user', authenticateJWT, async (req, res) => {
    try {
        const user = await UserModel.findByIdAndDelete(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        res.json({ message: 'Account eliminato con successo' });
    } catch (error) {
        res.status(500).json({ message: 'Errore del server' });
    }
});

// Avvio del server
app.listen(3001, () => {
    console.log("Server is Running on port 3001");
});
// Aggiornamento di una conversazione specifica
app.put('/api/conversations/:id', authenticateJWT, async (req, res) => {
    const { chatName } = req.body; // Aggiungi altri campi se necessario
    try {
        const conversation = await ConversationModel.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { chatName }, // Aggiungi altri aggiornamenti se necessario
            { new: true }
        );

        if (!conversation) {
            return res.status(404).json({ message: 'Conversazione non trovata' });
        }
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Errore del server' });
    }
});
