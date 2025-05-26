function returnUser(user,excludeFields=['password','refreshToken']){
    const retUser ={...user};
    for(const field of excludeFields){
        delete retUser[field]    
    }
    return retUser
}

export {returnUser}