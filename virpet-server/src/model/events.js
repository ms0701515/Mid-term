const fs = require('fs');
const uuid = require('uuid/v4');
const moment = require('moment');

function listEvents(searchText = '', unaccomplishedOnly = false, days = 0) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync('data-events.json')) {
            fs.writeFileSync('data-events.json', '');
        }

        fs.readFile('data-events.json', 'utf8', (err, data) => {
            if (err){
                console.log('readFile failed');
                reject(err);
            }
            let events = data ? JSON.parse(data) : [];

            if (unaccomplishedOnly) {
                events = events.filter(e => {
                    return !e.doneTs;
                });
            }
            if (days) {
                events = events.filter(e => {
                    const time = Math.round((moment(e.startDate,'YYYY-MM-DD').unix() - moment().unix())/86400);
                    console.log('Time = ', time);
                    if ((time <= days) && (time >= -1)) {
                        console.log('In assigned range!');
                        return true;
                    }else {
                        console.log('Not in assigned range!');
                        return false;
                    }
                });
            }
            if (searchText) {
                events = events.filter(e => {
                    return ((e.description.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) || (e.title.toLowerCase().indexOf(searchText.toLowerCase()) !== -1));
                });
            }
            resolve(events);
        });
    });
}

function createEvent(title, startDate, endDate, description) {
    return new Promise((resolve, reject) => {
        const newEvent = {
            id: uuid(),
            title: title,
            startDate: startDate,
            endDate: endDate,
            description: description,
			ts: moment().unix(),
            doneTs: null
        };
        console.log('events :',newEvent);
        listEvents().then(events => {
            console.log('in listEvents().then');
            events = [
                ...events,
                newEvent
            ];
            console.log(events);
            fs.writeFile('data-events.json', JSON.stringify(events), err => {
                if (err)
                    reject(err);
                resolve(newEvent);
            });
        }).catch((err) => {
            console.log('in listEvents().catch');
            console.error(err);
        })
    });
}

function accomplishEvent(id) {
    return new Promise((resolve, reject) => {
        // let accomplishTodoPost=null;
        listEvents().then(events => {
            events.map(p => {
                console.log(`P.ID : ${p.id}`);
                if (p.id === id) {
                    // accomplishTodoPost=p;
                    p.doneTs = moment().unix();
                }
                return p;
            })

            fs.writeFile('data-events.json', JSON.stringify(events), err => {
                if (err)
                    reject(err);

                resolve(events);
            });
        });
    });
}

function createAccount(account,key) {
    return new Promise((resolve,reject) => {
        if (!fs.existsSync('data-accounts.json')) {
            fs.writeFileSync('data-accounts.json', '');
        }
        fs.readFile('data-accounts.json', 'utf8', (err, data) => {
            if (err) {
                console.log('read account failed');
                reject(err);
            }
            let accountfound = false;
            let accounts = data ? JSON.parse(data) : [] ;

            let status = 'account-not-found';

            if (data) {
                accounts =  accounts.filter((item) => {
                    //todo : check if account exist and set accountfound to true
                    if (item.account === account) {
                        accountfound = true;
                        console.log('account found');
                        return true;
                    } else {
                        console.log('account not found');
                        return false
                    }
                })
                if (!accountfound){
                    //todo : create an account and write into data-accounts
                    const newAccount = {
                        id: uuid(),
                        account: account,
                        key: key
                    };
                    accounts = [
                        ...accounts,
                        newAccount
                    ];
                    fs.writeFile('data-accounts.json', JSON.stringify(accounts), err => {
                        if (err) {
                            status = 'Create-Account-failed';
                            resolve(status);
                        } else {
                            status = 'Create-Account-succeed';
                            resolve(status);
                        }
                    });
                } else {
                    accounts = accounts.filter((ac) => {
                        if (ac.key === key) {
                            console.log('account-key-matched!');
                            return true;
                        } else {
                            console.log('account-key-not-matched!');
                            return false;
                        }
                    });
                    if (accounts) {
                        status = 'login-success!';
                        resolve(status);
                    } else {
                        status = 'Wrong-Key!';
                        resolve(status);
                    }
                }
            } else {
                const newAccount = {
                    id: uuid(),
                    account: account,
                    key: key
                };
                accounts = [
                    ...accounts,
                    newAccount
                ];
                fs.writeFile('data-accounts.json', JSON.stringify(accounts), err => {
                    if (err) {
                        status = 'Create-Account-failed';
                        resolve(status);
                    } else {
                        status = 'Create-Account-succeed';
                        resolve(status);
                    }
                });
            }
        });
    });
}


module.exports = {
    listEvents,
    createEvent,
	accomplishEvent,
    createAccount
};
