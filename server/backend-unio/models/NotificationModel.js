import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {                   // destinataire obligatoire
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sender: {                      // expéditeur optionnel (prof, étudiant ou système)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    title: {                       // titre obligatoire de la notification
        type: String,
        required: true,
        trim: true,
    },
    
    link: {                        // lien vers une ressource ou projet (optionnel)
        type: String,
    },
    relatedCourse: {               // cours associé à la notification (optionnel)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    },
    relatedAcademy: {              // académie associée (optionnel)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Academie',
    },
    isRead: {                      // statut lu/non lu
        type: Boolean,
        default: false,
    },
    type: {                        // type de notification pour organisation
        type: String,
        enum: ['project_assigned', 'grade_posted', 'resource_added', 'general'],
        default: 'general',
    },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
