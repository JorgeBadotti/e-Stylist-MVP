import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
});

// Use email as the username field for passport-local-mongoose
userSchema.plugin(passportLocalMongoose.default, { usernameField: 'email' });

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', userSchema);

/**
 * Register a new user using passport-local-mongoose's register helper.
 * Returns the created user (without sensitive fields) or throws an error.
 */
export async function registerUser(email, password) {
    if (!email || !password) throw new Error('Missing email or password');

    const exists = await Usuario.findOne({ email }).exec();
    if (exists) {
        const err = new Error('User already exists');
        err.code = 'USER_EXISTS';
        throw err;
    }

    return new Promise((resolve, reject) => {
        Usuario.register(new Usuario({ email }), password, (err, user) => {
            if (err) return reject(err);
            // Remove passport-local-mongoose fields if present
            const safe = {
                id: user._id,
                email: user.email,
            };
            resolve(safe);
        });
    });
}

export default Usuario;