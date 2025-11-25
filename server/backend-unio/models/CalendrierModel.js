import mongoose from 'mongoose';

const calendrierSchema = new mongoose.Schema({
    titre: {                       // titre de l'événement
        type: String,
        required: true,
        trim: true,
    },
    description: {                 // description optionnelle
        type: String,
        default: "",
    },
    debut: {                        // date de début
        type: Date,
        required: true,
    },
    fin: {                          // date de fin (optionnel si événement d'une seule journée)
        type: Date,
    },
    proprietaire: {                // utilisateur propriétaire de l'événement
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    classe: {                      // classe associée (optionnel)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classe',
    },
    courseId: {                     // cours associé (optionnel)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    },
    type: {                         // type de l'événement
        type: String,
        enum: ['personnel', 'classe', 'projet', 'examen'],
        default: 'personnel',
    },
}, { timestamps: true });

const Calendrier = mongoose.model('Calendrier', calendrierSchema);
export default Calendrier;
