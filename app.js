import { manageDatabase } from "./main.js";


//  the Budget Controller
export const farmBudgetController = (function() {

    // function that creates income transaction object
    const IncomeTransaction = function(id, itemDate, itemPerson, itemDescription, itemTag, itemValue) {
        this.id = id,
        this.itemDate = itemDate,
        this.itemPerson = itemPerson,
        this.itemDescription = itemDescription,
        this.itemTag = itemTag,
        this.itemValue = itemValue
    };

    // function that creates expense transaction object
    const ExpenseTransaction = function(id, itemDate, itemPerson, itemDescription, itemTag, itemValue) {
        this.id = id,
        this.itemDate = itemDate,
        this.itemPerson = itemPerson,
        this.itemDescription = itemDescription,
        this.itemTag = itemTag,
        this.itemValue = itemValue
    };

    // function that calculates object totals 
    const calculateTotals = function(type) {
        let sum = 0;
        allData.transactionItems[type].forEach(each => {
            sum += each.itemValue
        })

        allData.totals[type] = sum;
    }

    // Data structure for all data sets
    let allData = {
        transactionItems: {
            exp: [],
            inc: [],
        },

        totals: {
            exp: 0,
            inc: 0,
            bal: 0,
            perc: -1
        }
    }


    return {

        // function to create income or expense object with form data
        addItem: function(type, itemDate, itemPerson, itemDescription, itemTag, itemValue) {
            let ID;
            
            // Expense item
            if (type === "exp") {

                // Create ID for transaction
                if (allData.transactionItems.exp.length > 0) {
                    ID = allData.transactionItems.exp[allData.transactionItems.exp.length - 1].id + 1;
                }
                else ID = 0

                // create Expense Object
                let newExpenseItem = new ExpenseTransaction(ID, itemDate, itemPerson, itemDescription, itemTag, itemValue);
                
                // data sent to db
                const dbData = manageDatabase.postDataExpense(localStorage.getItem("xxcc"), newExpenseItem.id, newExpenseItem.itemDate, newExpenseItem.itemPerson, newExpenseItem.itemDescription, newExpenseItem.itemTag, newExpenseItem.itemValue);

                // push item to allData array
                allData.transactionItems.exp.push(newExpenseItem);
                

                return newExpenseItem;

            }
            // Income item
            else if (type === "inc") {

                // create ID for transaction
                if (allData.transactionItems.inc.length > 0) {
                    ID = allData.transactionItems.inc[allData.transactionItems.inc.length - 1].id + 1;
                }
                else ID = 0

                // create Income object
                let newIncomeItem = new IncomeTransaction(ID, itemDate, itemPerson, itemDescription, itemTag, itemValue);


                // data sent to db
                const dbData = manageDatabase.postDataIncome(localStorage.getItem("xxcc"), newIncomeItem.id, newIncomeItem.itemDate, newIncomeItem.itemPerson, newIncomeItem.itemDescription, newIncomeItem.itemTag, newIncomeItem.itemValue);

                // push item to allData array
                allData.transactionItems.inc.push(newIncomeItem);

                return newIncomeItem;
            }
        },

        // function to retrieve all data from db and add to datastructure
        // getAllDataFromDB: function(userID) {
            
        //     const allDataFromDB = manageDatabase.getUserData(userID);
        //     console.log(allDataFromDB);

        //     // allData.transactionItems.exp.push(Object.values(allDataFromDB.expenses));

        //     // allData.transactionItems.inc.push(Object.values(allDataFromDB.incomes))
        // },

        // a function that sets a batch of incomes and expense into allData array
        setAllDataItems: function(incomes, expenses) {
            allData.transactionItems.inc = incomes;
            allData.transactionItems.exp = expenses;
        },

        deleteItem: function(type, ID) {

            const itemToDelete = allData.transactionItems[type].find(item => item.id === ID);
            const index = allData.transactionItems[type].indexOf(itemToDelete);

            if (index !== -1) allData.transactionItems[type].splice(index, 1);

            if(type === "exp") {
                manageDatabase.deleteAnExpense(localStorage.getItem("xxcc"), itemToDelete);
            } else if (type === "inc") {
                manageDatabase.deleteAnIncome(localStorage.getItem("xxcc"), itemToDelete);
            }
        },


        // A fuction to be used to set all totals in 
        // global data structure above
        calculateBudget: function() {

            // set expense and income totals
            calculateTotals("exp");
            calculateTotals("inc");

            // calculate net balance between income and expense
            allData.totals.bal = allData.totals.inc - allData.totals.exp;

            // calculate percentage of income as expense
            if (typeof (allData.totals.exp / allData.totals.inc) === "number" && allData.totals.exp > 0 && allData.totals.inc > 0) {
              allData.totals.perc = Math.round(
                (allData.totals.exp / allData.totals.inc) * 100
              );
            } else allData.totals.perc = 0;
        },

        getBudgetBalance: function() {
            this.calculateBudget()
            return {
                incomeBalance: allData.totals.inc,
                expenseBalance: allData.totals.exp,
                totalBalance: allData.totals.bal,
                percentageSpent: allData.totals.perc
            }
        },

        allDataOut: function() {
            return allData.transactionItems;
        }
    }

})();


//  the UI controller
export const UIController = (function() {
    let domStrings = {
        itemType: "item-type",
        itemDate: "item-date",
        itemPerson: "item-person",
        itemDescription: "item-description",
        itemTag: "item-tag",
        itemValue: "item-value",
        itemForm: "add_item_form",
        expenseTableBody: "#expense-table tbody",
        incomeTableBody: "#income-table tbody",
        errorOnForm: "error-on-form",
        incomeTotal: "income-total-balance",
        expenseTotal: "expense-total-balance",
        expensePercent: "exp-percent",
        balanceTotal: "total-balance",
        tableActivities: "table-activities-delete",
        tableRowDelete: "delete-row",
        timeDate: "time-date",
        cancelModal: "cancel",
        addNewItem: "add",
        addItemModal: "modal-form"
    }

    return {
        getInput: function() {
            return {
                itemType: document.getElementById(domStrings.itemType).value, // either inc or exp
                itemDate: document.getElementById(domStrings.itemDate).value || new Date().toISOString().substring(0, 10),
                itemPerson: document.getElementById(domStrings.itemPerson).value,
                itemDescription: document.getElementById(domStrings.itemDescription).value,
                itemTag: document.getElementById(domStrings.itemTag).value,
                itemValue: parseFloat(document.getElementById(domStrings.itemValue).value) || 0
            }
        },

        getFormStrings: function() {
            return domStrings;
        },

        controlAddItemModal: function() {
            // display modal for adding item
            const addI = document.getElementById(domStrings.addNewItem);
            const cancel = document.getElementById(domStrings.cancelModal);
            if (addI) {
                document.getElementById(domStrings.addNewItem).addEventListener('click', function(){

                    if (localStorage.getItem("xxcc")) {
                        document.getElementById(domStrings.addItemModal).style.display = "flex";
                    } else {
                        window.location.href = "login.html"
                        }
                    
                })
            }

            // close modal
            if (cancel) {
                document.getElementById(domStrings.cancelModal).addEventListener('click', () => {
                    document.getElementById(domStrings.addItemModal).style.display = "none";
                })
            }

        },

        getDatafromDB: async function(structure) {
            const userIsLogin = localStorage.getItem("xxcc") ? true : false;

            if(userIsLogin) {
                const success =await manageDatabase.getUserData(localStorage.getItem("xxcc"), structure);
                if(success) {
                    const dataOnReload = structure.allDataOut();
                    dataOnReload.exp.forEach(item => {
                        this.setTableRow("exp", item);
                    })

                    dataOnReload.inc.forEach(item => {
                        this.setTableRow("inc", item);
                    })

                    this.setBalances(structure)
                }
            } else {
                console.log("user not logged in");
            }
        },

        
        setTableRow: function(type, item) {
            let rowContent, tableRow;
            rowContent = `
                    <td>${item.id}</td> <td>${item.itemDate}</td> <td>${item.itemPerson}</td> <td>${item.itemDescription}</td> <td>${item.itemTag}</td> <td>${item.itemValue}</td><td><svg class="delete-row" width="20" height="20" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M29.6361 26.52L39.1391 17.0391C39.5552 16.6229 39.789 16.0585 39.789 15.47C39.789 14.8815 39.5552 14.3171 39.1391 13.9009C38.7229 13.4847 38.1585 13.251 37.57 13.251C36.9815 13.251 36.4171 13.4847 36.0009 13.9009L26.52 23.4039L17.0391 13.9009C16.6229 13.4847 16.0585 13.251 15.47 13.251C14.8815 13.251 14.3171 13.4847 13.9009 13.9009C13.4847 14.3171 13.251 14.8815 13.251 15.47C13.251 16.0585 13.4847 16.6229 13.9009 17.0391L23.4039 26.52L13.9009 36.0009C13.6938 36.2063 13.5293 36.4508 13.4171 36.7201C13.305 36.9894 13.2472 37.2783 13.2472 37.57C13.2472 37.8617 13.305 38.1506 13.4171 38.4199C13.5293 38.6892 13.6938 38.9336 13.9009 39.1391C14.1063 39.3462 14.3508 39.5107 14.6201 39.6229C14.8894 39.7351 15.1783 39.7928 15.47 39.7928C15.7617 39.7928 16.0506 39.7351 16.3199 39.6229C16.5892 39.5107 16.8337 39.3462 17.0391 39.1391L26.52 29.6361L36.0009 39.1391C36.2063 39.3462 36.4508 39.5107 36.7201 39.6229C36.9894 39.7351 37.2783 39.7928 37.57 39.7928C37.8617 39.7928 38.1506 39.7351 38.4199 39.6229C38.6892 39.5107 38.9336 39.3462 39.1391 39.1391C39.3462 38.9336 39.5107 38.6892 39.6229 38.4199C39.735 38.1506 39.7928 37.8617 39.7928 37.57C39.7928 37.2783 39.735 36.9894 39.6229 36.7201C39.5107 36.4508 39.3462 36.2063 39.1391 36.0009L29.6361 26.52Z" fill="red"/>
                    </svg></td>
                `;
            tableRow = document.createElement("tr");
            tableRow.id = `${type}-${item.id}`;
            tableRow.innerHTML = rowContent;

            if (type === 'exp') {
                
                document.querySelector(domStrings.expenseTableBody).prepend(tableRow)
            }

            else if (type === 'inc') {
                document.querySelector(domStrings.incomeTableBody).prepend(tableRow)
            }
            else {
                console.log(type + " is prohibited")
            }
        },

        // setTables: function(data) {
        //     for (item of data.exp) {
        //         this.setTableRow("exp", item)
        //     }

        //     for (item of data.inc) {
        //         this.setTableRow("inc", item)
        //     }
        // },

        deleteTableRow: function(rowID) {
            const elementToDelete = document.getElementById(rowID);
            elementToDelete.parentNode.removeChild(elementToDelete);
        },

        setBalances: function(budget) {

            const records = budget.getBudgetBalance()

            const incomeTotalUI = document.getElementById(domStrings.incomeTotal);

            // set total incomes into UI
            if (incomeTotalUI) {
                document.getElementById(domStrings.incomeTotal).textContent = "GHC " + records.incomeBalance;

                // set total expenses into UI
                document.getElementById(domStrings.expenseTotal).textContent = "GHC " + records.expenseBalance;

                // set total balances into UI
                document.getElementById(domStrings.balanceTotal).textContent = "GHC " + records.totalBalance;

                // set expense percentage into UI
                document.getElementById(domStrings.expensePercent).textContent = records.percentageSpent + "%";
            }
        },

        // clear the form fields after submission 
        clearField: function(form) {
            form.reset();
        },

        // display real live date and time
        getLiveTime: function() {
            const timeDate = document.getElementById(domStrings.timeDate);
            const setDateTime = function() {
                const dateString = new Date().toLocaleString();
                const formattedString = dateString.replace(",", "-");
                document.getElementById(domStrings.timeDate).innerText = formattedString;
            }

            if (timeDate) {
                setInterval(setDateTime, 1000);
            }
            
        }
    }
})();


//   the whole app controller
const appConstroller = (function(x,y) {

    const constrollerEvents = function() {
        // get DOM strings
        const DOMStrings = y.getFormStrings();

        // function that adds item
        const controlAddItem = function (e) {
            // 1. Get Form Data
            const inputsRecieved = y.getInput()
            
            const formValues = Object.values(inputsRecieved).filter(element => {
                return (element !== "" && element !== NaN && element !== null && typeof element !== 'object')
            })
            // 2. Add item to the budget calculator
            
            if (formValues.length >= 4) {
                document.getElementById(DOMStrings.errorOnForm).style.display = "none";
                const newItem = x.addItem(inputsRecieved.itemType, inputsRecieved.itemDate, inputsRecieved.itemPerson, inputsRecieved.itemDescription, inputsRecieved.itemTag, inputsRecieved.itemValue)

                // 3. Add item to the UI
                y.setTableRow(inputsRecieved.itemType, newItem)
                y.clearField(e.target);

                // setbalances
                y.setBalances(x);
            } else {
                document.getElementById(DOMStrings.errorOnForm).style.display = "flex";
                y.clearField(e.target);
            }

        }

        // function that deletes item
        const controlDeleteItem = function(e) {
            const itemID = e.target.parentNode.parentNode.id;

            if (itemID) {
                const id = parseInt(itemID.split("-")[1]);
                const type = itemID.split("-")[0]
                
                // delete item data from data structure
                x.deleteItem(type, id);

                // setbalances again
                y.setBalances(x);

                // delete parent node or table row from UI
                y.deleteTableRow(itemID);
            }
        }

        // add item form submit listener
        const itemForm = document.getElementById(DOMStrings.itemForm);

        if (itemForm) {
            document.getElementById(DOMStrings.itemForm).addEventListener('submit', (event)=>{
                event.preventDefault()
                controlAddItem(event);
            });
        }

        // delete item event listener
        const tableActivities = document.getElementById(DOMStrings.tableActivities);

        if (tableActivities) {
            document.getElementById(DOMStrings.tableActivities).addEventListener('click', (event) => {
                controlDeleteItem(event);
    
                // console.log(x.test())
            });
        }

        // set live time 
        y.getLiveTime();

        // control modal for adding item
        y.controlAddItemModal();

        // get data from db to datastructure
        y.getDatafromDB(x);

        // print out data
        console.log(x.allDataOut())

        // 4. Calculate totals and balance
        if (localStorage.getItem("xxcc")) {
            // call values from DB
            // x.getDataFromDataBase(localStorage.getItem("xxcc"));
            // calculate budget
            x.calculateBudget();

            // setbalances
            y.setBalances(x);
        }

    }
    return {
        init: function() {
            constrollerEvents();
        }
    }
})(farmBudgetController, UIController);

appConstroller.init();
