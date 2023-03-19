import firebase from 'firebase/compat/app';
export interface Result {
    id: string
    surveyId: string
    answers: any[]
    createdTime: firebase.firestore.Timestamp
}