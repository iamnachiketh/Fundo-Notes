import mongoose from "mongoose";


interface Note {

    noteId: string;
    userEmail: string;
    title: string;
    desc: string;
    isTrash: boolean;
    isArchive: boolean;
    color: string

}

const NoteSchema = new mongoose.Schema<Note>({

    noteId: { type: String, required: true, unique: true },
    userEmail: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    isTrash: { type: Boolean, default: false },
    isArchive: { type: Boolean, default: false },
    color: { type: String, default: "white" }

})


export default mongoose.model("notes", NoteSchema);