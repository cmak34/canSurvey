import * as firebase from 'firebase/compat/app'
export interface Survey {
    id: string
    title: string
    desc: string
    questions: {
        label: string
        type: ("text"|"textarea"|"select"|"radio"|"checkbox"|"date")
        options: any[]
        required: boolean
    }[]
    createdTime: firebase.default.firestore.Timestamp
    updatedTime: firebase.default.firestore.Timestamp
}