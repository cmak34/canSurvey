import firebase from 'firebase/compat/app';
export interface Survey {
    id: string
    title: string
    desc: string
    questions: {
        label: string
        type: ("text"|"textarea"|"select"|"radio"|"checkbox"|"date")
        options: string[]
        required: boolean
    }[]
    isPublished: boolean
    createdTime: firebase.firestore.Timestamp
    updatedTime: firebase.firestore.Timestamp
}