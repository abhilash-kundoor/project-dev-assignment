const Order = require("./order");

const burger_base_cost = 4;
const pizza_base_cost = 8;
const sandwich_base_cost = 6;
const small_mutliplier = 1;
const medium_sMultiplier = 2;
const large_sMultiplier = 3;
const drinks_cost = 3;
const filling_cost = 2;
const topping_cost = 3;
const addons_cost = 5;
const tax_rate = 0.13;
let aReturn = [];
const OrderState = Object.freeze({
    WELCOMING: Symbol("welcoming"),
    SIZE: Symbol("size"),
    TOPPINGS: Symbol("toppings"),
    FILLINGS: Symbol("fillings"),
    DRINKS: Symbol("drinks"),
    ADDONS: Symbol("addons"),
    CONTINUE: Symbol("continue"),
    PRINT: Symbol("print"),
    PAYMENT: Symbol("payment")
});

function validateInput(input, keywords){
    for (var word of keywords){
        if (input.toLowerCase() == word.toLowerCase()){
            return true;
        }}
    aReturn = [];    
    aReturn.push("Sorry wrong option !!");
    var message = "";
    message += `Please select ${keywords.join(" / ")}`;
    aReturn.push(message);
}

module.exports = class ShwarmaOrder extends Order {
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sSize = "";
        this.sToppings = "";
        this.sFillings = "";
        this.sDrinks = "";
        this.sItem = "";
        this.sAddons = "",
        this.sContinue = "";
        this.sText = "";
        this.sBasePrice = 0;
        this.sMultiplier = 0;
        this.sCost = 0;
        this.sPostTaxCost = 0;
        this.sTax = 0;
    }
    handleInput(sInput) {
        aReturn = [];
        switch (this.stateCur) {
            case OrderState.WELCOMING:
                this.stateCur = OrderState.SIZE;
                if (this.sText == "") {
                    aReturn.push("Welcome to Abhilash's food court.");
                }
                aReturn.push("We serve Burger, Pizza and Sandwich");
                aReturn.push("What would you like to have?");
                break;
            case OrderState.SIZE:
                this.sItem = sInput;
                if (validateInput(this.sItem, ["Pizza", "Burger", "Sandwich"])){
                    if (this.sItem.toLowerCase() == "pizza") {
                        this.stateCur = OrderState.TOPPINGS;
                        this.sBasePrice = pizza_base_cost;
                    } else if (this.sItem.toLowerCase() == "burger") {
                        this.stateCur = OrderState.FILLINGS;
                        this.sBasePrice = burger_base_cost;
                    } else if (this.sItem.toLowerCase() == "sandwich") {
                        this.stateCur = OrderState.FILLINGS;
                        this.sBasePrice = sandwich_base_cost;
                    }
                    aReturn.push("What size would you like?");
                    aReturn.push("Small, Medium, Large");
                }
                break;
            case OrderState.FILLINGS:
                this.sSize = sInput;
                if (validateInput(this.sSize, ["Small", "Medium", "Large"])){
                this.stateCur = OrderState.DRINKS;
                this.sCost += filling_cost;
                aReturn.push("What filling would you like?");
                aReturn.push("Bacon, Lettuce, Eggs");
                }
                break;
            case OrderState.TOPPINGS:
                this.sSize = sInput;
                if (validateInput(this.sSize, ["Small", "Medium", "Large"])){
                this.stateCur = OrderState.DRINKS;
                this.sCost += topping_cost;
                aReturn.push("What topping would you like?");
                aReturn.push("Pepperoni, Mushroom, Sausage");
                }
                break;
            case OrderState.DRINKS:
                this.sToppings = sInput;
                var options = (this.sItem.toLowerCase() == "pizza") ? ["Pepperoni", "Mushroom", "Sausage"] : ["Bacon", "Lettuce", "Eggs"];
                if (validateInput(this.sToppings, options)){
                this.stateCur = OrderState.ADDONS;
                aReturn.push("Would you like drinks with that?");
                }
                break;
            case OrderState.ADDONS:
                this.sDrinks = sInput;
                if (validateInput(this.sDrinks, ["Yes", "No"])){
                this.stateCur = OrderState.CONTINUE;
                aReturn.push("Would you like to have any of the following addons?");
                aReturn.push("Fudge, Fries, Wings");
                }
                break;
            case OrderState.CONTINUE:
                this.sAddons = sInput;
                if (validateInput(this.sAddons, ["Fudge", "Fries", "Wings", "No"])){
                    this.stateCur = OrderState.PRINT;
                if (this.sSize.toLowerCase() == "small") {
                    this.sMultiplier = small_mutliplier;
                } else if (this.sSize.toLowerCase() == "medium") {
                    this.sMultiplier = medium_sMultiplier;
                } else if (this.sSize.toLowerCase() == "large") {
                    this.sMultiplier = large_sMultiplier;
                }
                this.sCost += this.sBasePrice * this.sMultiplier;
                this.sText += `${this.sSize} ${this.sItem} with ${this.sToppings}`;
                if (this.sAddons && this.sAddons.toLowerCase() != "no") {
                    this.sText += `, ${this.sAddons}`;
                    this.sCost += addons_cost;
                }
                if (this.sDrinks && this.sDrinks.toLowerCase() != "no") {
                    this.sText += " and Coke. ";
                    this.sCost += drinks_cost;
                } else {
                    this.sText += ". "
                }
                aReturn.push("Would you like to order anything else?");
            }
                break;
            case OrderState.PRINT:
                this.sContinue = sInput;
                if (validateInput(this.sContinue, ["Yes", "No"])){
                if (this.sContinue.toLowerCase() == "yes") {
                    aReturn.push("Press yes to order again");
                    this.sContinue = sInput;
                    if (validateInput(this.sContinue, ["Yes"])){
                    this.stateCur = OrderState.WELCOMING;
                    }
                } else {
                    //this.isDone(true);
                    this.stateCur = OrderState.PAYMENT;
                    aReturn.push("Thank you for your order of");
                    aReturn.push(this.sText);
                    this.sTax = this.sCost * tax_rate;
                    this.sPostTaxCost = this.sCost + this.sTax;
                    aReturn.push(`Total Cost: ${this.sPostTaxCost.toFixed(2)}$`);
                    aReturn.push(`Please pay for your order here`);
                    aReturn.push(`<a href="${this.sUrl}/payment/${this.sNumber}/" target="_blank">Pay with Paypal</a>`);
                }
            }
                break;
            case OrderState.PAYMENT:
                var address = sInput.purchase_units[0].shipping.address;
                var name = `${sInput.payer.name.given_name} ${sInput.payer.name.surname}`
                this.isDone(true);
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                aReturn.push(`Your order will be delivered to ${name}, ${address.address_line_1}, ${address.admin_area_2}, 
                ${address.admin_area_1}, ${address.postal_code}, ${address.country_code} at ${d.toLocaleString()}`);
                break;
        }
        return aReturn;
    }
    renderForm(sTitle = "-1", sPostTaxCost = "-1") {
        // your client id should be kept private
        if (sTitle != "-1") {
            this.sItem = sTitle;
        }
        if (sPostTaxCost != "-1") {
            this.nOrder = sPostTaxCost;
        }
        const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
        return (`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your order of $${this.sPostTaxCost.toFixed(2)}.
        <div id="paypal-button-container"></div>
  
        <script>
        var value;
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.sPostTaxCost.toFixed(2)}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                   $.post(".", details, ()=>{
                       window.open("", "_self");
                       window.close(); 
                     });
                });
              }
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);

    }
}