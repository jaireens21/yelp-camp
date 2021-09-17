//linked to boilerplate.ejs via script tag
//need to add app.use(express.static('public')) in app.js

//https://getbootstrap.com/docs/5.1/forms/validation/
// Example starter JavaScript for disabling form submissions if there are invalid fields
        
(function () {
    'use strict'
          
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
          
    // Loop over them and prevent submission
    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }
          
            form.classList.add('was-validated')
        }, false)
    })
})()