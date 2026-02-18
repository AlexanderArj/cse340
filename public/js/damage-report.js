'use strict'

let classificationList = document.querySelector("#classificationList")

let inventoryList = document.querySelector("#inventoryList")

classificationList.addEventListener("change", function () {
    let classification_id = classificationList.value

    if (classification_id != "") {
        let classIdURL = "/inv/getInventory/" + classification_id
        
        fetch(classIdURL)
            .then(function (response) {
                if (response.ok) return response.json();
                throw Error("Network response was not OK");
            })
            .then(function (data) {
                buildVehicleOptionList(data);
            })
            .catch(function (error) {
                console.log('Problem: ', error.message)
            })
    } else {
        inventoryList.innerHTML = '<option value="">-- Select classification --</option>';
        inventoryList.setAttribute("disabled", "disabled");
    }
})

function buildVehicleOptionList(data) {

    inventoryList.innerHTML = '<option value="">-- Choose a Vehicle --</option>';

    inventoryList.removeAttribute("disabled");

    data.forEach(function (vehicle) {
        let option = document.createElement("option");
        option.value = vehicle.inv_id;
        option.textContent = `${vehicle.inv_make} ${vehicle.inv_model} (${vehicle.inv_year})`;
        inventoryList.appendChild(option);
    });
}