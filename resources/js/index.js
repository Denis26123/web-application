
//------------------//
// Schedule Section //
//------------------//

function saveProfile() {
    
    const name = document.getElementById("username").value;
    const age = document.getElementById("age").value;
    const height = document.getElementById("height").value;
    const weight = document.getElementById("weight").value;
    const goal = document.getElementById("goal").value;

    if (name && age && height && weight && goal) {
        document.getElementById("res-username").textContent = name;
        document.getElementById("res-age").textContent = age;
        document.getElementById("res-height").textContent = height;
        document.getElementById("res-weight").textContent = weight;
        document.getElementById("res-goal").textContent = goal;

        document.querySelector(".js--profile-result").style.display = "block";
    } else {
        alert("Please fill out all fields.");
    }
}

let prev = ["mutable", "array"];

const makeSchedule = () => {
    setTimeout(() => {
        planWorkout();
    }, 100);
}

const planWorkout = () => {
    let resultArray = [];

    //make an array for the muscles that are checked on checkboxes.
    const muscleArray = ['Chest','Back','Legs','Shoulder','Biceps','Triceps','Abs'];
    let checkboxArray = document.querySelectorAll(".muscle-checkboxes input");
    for (i=0;i<checkboxArray.length;i++) {
        if (checkboxArray[i].checked == false) {
            muscleArray.splice(muscleArray.indexOf(checkboxArray[i].id),1);
        }
    }

    //number of muscle parts checked
    const checkedNumber = muscleArray.length;
    //In case that no muscle is checked
    if (checkedNumber <= 0) {
        alert("Please select at least one muscle");
    }

    //there is some muscle checked.
    else {

        let restOrNot = false;
        
        for (let i = 0; i < 7; i++) {

            //when array is empty || rest is needed after big muscle day
            if (muscleArray.length <= 0 || restOrNot == true) {
                resultArray.push("<em>-rest-</em>");
                restOrNot = false;
            } 
            
            //when array is still not empty and no rest is needed.
            else {

                //for random which muscle to be on each day
                let muscleRandom = Math.floor(Math.random()*muscleArray.length);

                //1 Chest + Triceps
                if (muscleArray[muscleRandom] == "Chest" && muscleArray.includes("Triceps") || muscleArray[muscleRandom] == "Triceps" && muscleArray.includes("Chest")) {
                    resultArray.push("<strong>Chest + Triceps</strong>");
                    muscleArray.splice(muscleArray.indexOf("Chest"),1);
                    muscleArray.splice(muscleArray.indexOf("Triceps"),1);
                    restOrNot = true; 
                }
                
                //2 Back + Biceps
                else if (muscleArray[muscleRandom] == "Back" && muscleArray.includes("Biceps") || muscleArray[muscleRandom] == "Biceps" && muscleArray.includes("Back")) {
                    resultArray.push("<strong>Back + Biceps</strong>");
                    muscleArray.splice(muscleArray.indexOf("Back"),1);
                    muscleArray.splice(muscleArray.indexOf("Biceps"),1)
                    restOrNot = true;
                }    
                
                //3 Chest without Triceps || Back without Biceps || Legs Day
                else if (muscleArray[muscleRandom] == "Chest" || muscleArray[muscleRandom] == "Back" || muscleArray[muscleRandom] == "Legs") {
                    resultArray.push("<strong>" + muscleArray[muscleRandom] + "</strong>");
                    muscleArray.splice(muscleArray.indexOf(muscleArray[muscleRandom]),1);
                    restOrNot = true;
             
                }

                //4 Shoulder + Abs
                else if (muscleArray[muscleRandom] == "Shoulder" && muscleArray.includes("Abs") || muscleArray[muscleRandom] == "Abs" && muscleArray.includes("Shoulder")) {
                    resultArray.push("<strong>Shoulder + Abs</strong>");
                    muscleArray.splice(muscleArray.indexOf("Shoulder"),1);
                    muscleArray.splice(muscleArray.indexOf("Abs"),1);
                }

                //5 everything else: Shoulder / Abs / Biceps / Triceps
                else {
                    resultArray.push("<strong>" + muscleArray[muscleRandom] + "</strong>");
                    muscleArray.splice(muscleArray.indexOf(muscleArray[muscleRandom]),1);
                }       
            }
        }


        //if got the same result, run the function again!
        const joinedPrev = prev.filter(x => x !== "<em>-rest-</em>").join("");;
        const joinedResult = resultArray.filter(x => x !== "<em>-rest-</em>").join("");

        prev = resultArray; // save for comparing in the next time
        if (joinedPrev === joinedResult && checkedNumber >= 2) {
            return planWorkout();
        }

        //change the first day of workout.
        let allDaysInWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
        let firstDay = document.querySelector("#firstday").value;
        let indexOfFirstDay = allDaysInWeek.indexOf(firstDay);
        for (i=0;i<indexOfFirstDay;i++) {
            resultArray.unshift(resultArray.pop());
        }

        //put the muscle that is re-arrayed by first day into <span></span>
        let scheduleResultArray = document.querySelectorAll(".schedule-result span");
        for (i=0;i<scheduleResultArray.length;i++) {
            scheduleResultArray[i].innerHTML = resultArray[i];
        }

        //show the result 
        document.querySelector(".schedule-result").style.display = "block";
    }

}

//------------------//
// Calories Section //
//------------------//

let foodArray = [];
let counter = 0;
let foodNote = "";

const addFood = (e) => {
    e.preventDefault();

    //food name is not defined
    if (document.querySelector("#food-name").value == "") {
        alert("Please define the name of the menu");
        return;
    }

    else {

        //adding an element into foodArray with properties.
        const nameInput = document.querySelector("#food-name").value;
        const calInput = document.querySelector("#food-calories").value;
        const proteinInput = document.querySelector("#food-protein").value;
        foodArray[counter] = {};
        foodArray[counter].name = nameInput;
        foodArray[counter].calories = (calInput != "") ? parseInt(calInput) : 0;
        foodArray[counter].protein = (proteinInput != "") ? parseInt(proteinInput) : 0;

        //making a note of all food taken
        foodNote = foodNote + "<strong>Menu:</strong> "+ foodArray[counter].name +
        "  <br class='break-menu'><strong>Calories:</strong> " + foodArray[counter].calories +
        " <strong>Protein:</strong> " + foodArray[counter].protein + "<br>";
        document.querySelector(".food-note span").innerHTML = foodNote;

        counter++

        //clear the blank
        const foodName = document.querySelector("#food-name")
        foodName.value = "";
        foodName.focus();
        document.querySelector("#food-calories").value = "";    
        document.querySelector("#food-protein").value = "";

    }
}

// handle form submitting
const calForm = document.querySelector(".cal-form")
calForm.addEventListener("submit", addFood);

//Clear everything
const clearFood = () => {
    foodArray = [];
    counter = 0;
    foodNote = "";
    document.querySelector(".input-calories span").innerHTML = foodNote;
    document.querySelector(".cal-cal").style.display = "none";
    
}

//calculate all the calories and protein intake
const calCal = () => {
let allCalories = 0;
let allProtein = 0;
    for (i=0;i<foodArray.length;i++) {
        allCalories = allCalories + foodArray[i].calories;
        allProtein = allProtein + foodArray[i].protein;
    }
    document.querySelector("#all-calories").innerHTML = allCalories;
    document.querySelector("#all-protein").innerHTML = allProtein;
    document.querySelector(".cal-cal").style.display = "block";
}


