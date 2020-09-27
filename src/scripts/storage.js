class Storage{
    constructor(){
        this.ls = localStorage
    }

    set(name, val){
        this.ls[name] = val
    }

    get(name, callback){
        callback(this.ls.name)
    }

}