import { call } from "file-loader";

export default class Storage{
    constructor(){
        this.ls = localStorage
    }

    set(name, val, callback){
        this.ls.setItem("_ntl_" + name, JSON.stringify(val))
        if(callback){callback()}
    }

    get(name, callback){
        let retrievedObject = this.ls.getItem("_ntl_" + name);
        callback(JSON.parse(retrievedObject))
    }

    delete(name, callback){
        this.ls.removeItem("_ntl_" + name)
        if(callback){callback()}
    }

    getItemsList(callback){
        console.log("LS TEST")
        let tmp = []
        for (let i = 0; i < this.ls.length; i++){
            let key = this.ls.key(i)
            if(key.startsWith("_ntl_")){
                tmp.push(key.slice(5))
            }
        }
        // console.log(this.ls)
        // console.log(tmp)
        callback(tmp)
    }
}

