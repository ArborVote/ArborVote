export function authHeader() {
    // return authorization header with jwt token
    let user = JSON.parse(localStorage.getItem('user'));

    if (user && user.token) {
        return { 'Authorization': 'Bearer ' + user.token };
    } else {
        return {};
    }
}

export const wait = async ms => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};


export function logReceipt(receipt) {
    console.log("Receipt: ");
    Object.keys(receipt).map((key, index) => {
        console.log(key, receipt[key]);
    });
}
