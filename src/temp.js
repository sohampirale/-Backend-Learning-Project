async function cal(){
    console.log('inside cal()');
    let num=0;
    for(let i=0;i<=10000000000;i++){
        num+=1;
    }
    return num;
}


async function start(){
    console.log('before promise.resolve');
    Promise.resolve(cal()).catch((err)=>{
        console.log('ERROR : '+err);
    })
    console.log('after promise.resolve');
}

start();