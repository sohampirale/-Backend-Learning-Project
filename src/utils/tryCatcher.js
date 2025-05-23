function tryCatcher(func,onSuccess,onFailure){
    try{
        func();
        onSuccess();
    } catch(err){
        catchMsg(err);
    }
}

export default tryCatcher;