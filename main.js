import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";

// import { getDatabase, ref, set, onValue, child, push, update } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


import { farmBudgetController, UIController } from "./app.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXWSgTpfxzQ0nTC0kMYXXl_iCz27OnCiY",
  authDomain: "record-board.firebaseapp.com",
  projectId: "record-board",
  storageBucket: "record-board.appspot.com",
  messagingSenderId: "266952680922",
  appId: "1:266952680922:web:f4f3943c69b9a0f3680ce3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Frebase Auth
const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const handleAuth = (function() {

    const authDom = {
        // signup DOM strings
        signupForm: "signup-form",
        userEmail: "user-email",
        confirmEmail: "confirm-email",
        userPassword: "user-password",
        confirmPassword: "confirm-password",
        signupError: "signup-error",
        farmName: "farm-name",

        // login DOM strings
        loginForm: "login-form",
        loginEmail: "login-email",
        loginPassword: "login-password",
        loginError: "login-error",

        // login signup signout
        signUp: "signup-tab",
        login: "login-tab",
        signOut: "signout-tab"
    }
    return {

        // signup form input values
        getsignupInputs: function() {
            return {
                farmName: document.getElementById(authDom.farmName).value,
                email: document.getElementById(authDom.userEmail).value,
                confirmEmail: document.getElementById(authDom.confirmEmail).value,
                password: document.getElementById(authDom.userPassword).value,
                confirmPassword: document.getElementById(authDom.confirmPassword).value
            }
        },

        getloginInputs: function() {
            return {
                loginEmail: document.getElementById(authDom.loginEmail).value,
                loginPassword: document.getElementById(authDom.loginPassword).value
            }
        },

        clearField: function(form) {
            form.reset();
        },

        getAuthDom: function() {
            return authDom;
        }

    }
})()


export const manageDatabase = (function() {
    
    return {
        // add new user data to db
        addNewUser: async function(userID, farmName, userEmail) {
            
            try {
                await setDoc(doc(db, "users", userID), {
                    farmName: farmName,
                    userEmail: userEmail,
                    userIncomes: [],
                    userExpenses: []
                });
                console.log("Document written with ID: ")
            } catch(e) {
                console.error("Error adding document: ", e);
            }
            // set(ref(db, "users/" + userID), {
                // farmName: farmName,
                // userEmail: userEmail,
                // userIncomes: [],
                // userExpenses: []
            // })                      
        },

        // retrieve a user's data
        getUserData: async function(userID, dataStructure) {
            const userRef = doc(db, "users", userID);

            try {
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    console.log("document data: ", docSnap.data())
                    const data = docSnap.data();

                    dataStructure.setAllDataItems(Object.values(data.userIncomes), Object.values(data.userExpenses))
                    // console.log("object values exp: ", Object.values(data.userExpenses))
                    // console.log("object values inc: ", Object.values(data.userIncomes))
                    // console.log("array exp: ", data.userExpenses)
                    // console.log("array inc: ", data.userIncomes)
                    return true;
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                    return false;
                }
            } catch (e) {
                console.log("couldnt retrieve the user's data: ", e)
                return false;
            }

            // const userItems = ref(db, `users/${userID}`);
            // onValue(userItems, (snapshot) => {
                
            //     let incomes = Object.values(snapshot.val().userIncomes);
            //     let expenses = Object.values(snapshot.val().userExpenses);
                
            //     farmBudgetController.setAllDataItems(incomes, expenses)
            // })
        },

        // push an expense data to collection of a user
        postDataExpense: async function(userID, id, itemDate, itemPerson, itemDescription, itemTag, itemValue) {
            const postData = {
                id: id,
                itemDate: itemDate,
                itemPerson: itemPerson,
                itemDescription: itemDescription,
                itemTag: itemTag,
                itemValue: itemValue
            };

            const userRef = doc(db, "users", userID);

            // add new expense to expense array field
            try {
                await updateDoc(userRef, {
                    userExpenses: arrayUnion(postData)
                });
                console.log("expense data sent")
            } catch (e) {
                console.log("an error occured: ", e)
            }



            // // get key from expense array in database
            // const newExpenseKey = push(child(dbRef, `users/${userID}/userExpenses`)).key;

            // // write new data to Expenses list
            // const updates = {};
            // updates[`users/${userID}/userExpenses/` + newExpenseKey] = postData;

            // return update(dbRef, updates);
        },


        // push an income data to collection of a user
        postDataIncome: async function(userID, id, itemDate, itemPerson, itemDescription, itemTag, itemValue) {
            const postData = {
                id: id,
                itemDate: itemDate,
                itemPerson: itemPerson,
                itemDescription: itemDescription,
                itemTag: itemTag,
                itemValue: itemValue
            };

            // get user reference in db
            const userRef = doc(db, "users", userID);

            // add new income to income array field
            try {
                await updateDoc(userRef, {
                    userIncomes: arrayUnion(postData)
                });
                console.log("income data sent")
            } catch (e) {
                console.log("an error occured: ", e)
            }
        },

        // delete an income item from income collection of user
        deleteAnIncome: async function(userID, item) {

            // get user reference in db
            const userRef = doc(db, "users", userID);

            // remove income from income array field
            try {
                await updateDoc(userRef, {
                    userIncomes: arrayRemove(item)
                });
                console.log("income data deleted")
            } catch (e) {
                console.log("an error occured: ", e)
            }
        },

        // delete an expense item from expenses collection of user
        deleteAnExpense: async function(userID, item) {

            // get user reference in db
            const userRef = doc(db, "users", userID);

            // remove expense from expense array field
            try {
                await updateDoc(userRef, {
                    userExpenses: arrayRemove(item)
                });
                console.log("expense data deleted")
            } catch (e) {
                console.log("an error occured: ", e)
            }
        }

    }
})()


export const dataInLocalStorage = (function() {
    return {
        setLocalItem: function(key, value) {
            localStorage.setItem(key, value);
        },

        getLocalItem: function(key) {
            return localStorage.getItem(key);
        },

        clearLocalItem: function(key) {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
        }
    }
})()


const controlAuth = (function(au, dtb, localSt) {
    // get DOM strings
    const domStrings = au.getAuthDom();

    // signup form
    const signMeIn = document.getElementById(domStrings.signupForm);
    // login form
    const loginMeIn = document.getElementById(domStrings.loginForm);
    

    // main auth controller function
    const allAuth = function() {

        // sign up enter
        if (signMeIn) {
            signMeIn.addEventListener('submit', (e) => {
                e.preventDefault();
                const signupDetails = au.getsignupInputs()
    
                const actualsignupValues = Object.values(signupDetails).filter(element => {
                    return (element.trim() != "" && element !== null && typeof element !== 'object')
                })
    
                if (actualsignupValues.length >= 2) {
                    document.getElementById(domStrings.signupError).style.display = "none"
                    au.clearField(e.target);
    
                    // firebase create user
                    createUserWithEmailAndPassword(auth, signupDetails.email, signupDetails.password)
                        .then((userCredential) => {
                            // Signed in 
                            const user = userCredential.user;
                            // add new user to firebase RT db
                            dtb.addNewUser(user.uid, signupDetails.farmName, signupDetails.email);

                            // set user uid into localstorage
                            localSt.setLocalItem("xxcc", user.uid);

                            localSt.setLocalItem("name", signupDetails.farmName)

                            window.location.reload();

                            setTimeout (
                                window.alert(`${signupDetails.farmName} Account Successfully created!!`), 5000
                            );
    
                        })
                        .catch((error) => {
                            document.getElementById(domStrings.signupError).style.display = "block";
                            console.log(error.message);
                            console.log(error.code);
                        });
                } else {
                    document.getElementById(domStrings.signupError).style.display = "block";
                }
            })
        }

        // login enter
        if (loginMeIn) {
            loginMeIn.addEventListener('submit', function(event) {
                event.preventDefault();
    
                // get login values
                const loginDetails = au.getloginInputs();
                au.clearField(event.target);
    
                // firebase login
                signInWithEmailAndPassword(auth, loginDetails.loginEmail, loginDetails.loginPassword)
                    .then((userCredential) => {
                        // entered successfully
                        document.getElementById(domStrings.loginError).style.display = "none";                        
                        const user = userCredential.user;

                        localSt.setLocalItem("xxcc", user.uid);                     

                        setTimeout (
                            window.alert("Welcome back! You are Smart!!"), 5000
                        )
                        
                        // dtb.getUserData(user.uid)
                        window.location.href = "index.html";
                        
                        
                    })
                    .catch((error) => {
                        console.log(loginDetails.loginEmail, loginDetails.loginPassword);
                        console.log(error.code)
                        console.log(error.message)
                        document.getElementById(domStrings.loginError).style.display = "block";
                    });
    
            })
        }        
    }

    return {
        init: function() {
            allAuth()
        }
    }
})(handleAuth, manageDatabase, dataInLocalStorage)

controlAuth.init();

/**
 * How REALTIME DB WORKS
 * 1. Integrate the Firebase RT db SDK with a script include
 * 2. Create Realtime db references to set data
 * 3. Set data and listen for changes.Use the reference to do that
 * 4. Enable offline persistence
 * 5. Secure data
 */
