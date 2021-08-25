import { makeAutoObservable, runInAction} from "mobx"
import {IUser} from '../components/User'
import GitHubAPI from '../services/GitHubAPI'
import db from './AppDatabase'
import Dexie from "dexie";

class UserStore {
    private static instance?: UserStore 
    dexieUserTable: Dexie.Table<IUser, number>
    userAPI: (numberUser?:number) => Promise<IUser[]>;
    isLoading = true
    private constructor(
        dexieUserTable: Dexie.Table<IUser, number>
        ,userAPI:(numberUser?:number) => Promise<IUser[]> 
        ) {
        makeAutoObservable(this)
        this.userAPI = userAPI
        this.dexieUserTable = dexieUserTable
        console.log('loadUserFromAPI called in constructor')
        this.loadUserFromAPI()
    }

    static getInstance(){
        if(this.instance){
            return this.instance
        }
        this.instance = new UserStore(db.users,GitHubAPI);
        return this.instance
    }
    loadUserFromAPI() {
        console.log('loadUserFromAPI called')

        this.isLoading = true
        this.userAPI().then((users) => {
            runInAction(() => {
                this.dexieUserTable.bulkPut(users)
                .then((lastkey) => console.log(`Last index: ${lastkey}`))
                this.isLoading = false
            })
        })
    }

    clearData(){
        runInAction(() => {
            this.dexieUserTable.clear()
            console.log('clearData()',this.dexieUserTable.toArray())
        })
    }
    get users(){
        return this.dexieUserTable
    }

}

export default UserStore