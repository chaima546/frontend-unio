import mongoose from 'mongoose';

const ressourceSchema = new mongoose.Schema({
    titre: {                     // titre de la ressource
        type: String,
        required: true,
        trim: true,
    },
    description: {               // description optionnelle
        type: String,
        default: "",
    },
    type: {                      // type de ressource
        type: String,
        enum: ['file', 'link', 'video', 'image'],
        default: 'file',
    },
    url: {                       // lien ou fichier
        type: String,
        required: true,
    },
    classe: {                    // référence à la classe (optionnelle)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classe',
    },
    courseId: {                  // référence au cours (optionnelle)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    },
    academyId: {                 // référence à l'académie
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Academie',
    },
    uploadedByUser: {            // utilisateur qui a uploadé
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    uploadedByProf: {            // professeur qui a uploadé (now also in User model with role='prof')
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

const Ressource = mongoose.model('Ressource', ressourceSchema);
export default Ressource;
