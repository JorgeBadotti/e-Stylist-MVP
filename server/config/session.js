import session from 'express-session';
import MongoStore from 'connect-mongo';

export const configureSession = () => {
    return session({
        secret: process.env.SESSION_SECRET || 'super_secret_key',
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            mongoUrl: process.env.MONGODB_URI,
            dbName: process.env.MONGO_DB, // ✅ Usa o mesmo banco definido em .env
            collectionName: 'sessions',
            touchAfter: 24 * 3600 // Lazy session update (em segundos)
        }),
        cookie: {
            secure: process.env.NODE_ENV === 'production', // Em produção, use true com HTTPS
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 dia
        }
    });
};

export default configureSession;
