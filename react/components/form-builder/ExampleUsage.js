import FormBuilder from "./FormBuilder";
import {FormConfigData} from "./example-form-data-config";

const ExampleUsage = (props) => {
    const buttonLabel = "Submit";

    //Callback function when form is submitted
    //Values of the form data are passed to this function
    const submitHandler = (values) => {
        console.log(values)
    }

    return (
        <>
            <FormBuilder
                data={FormConfigData()}
                submitCallback={submitHandler}
                submitButtonText={buttonLabel}
            />
        </>
    );
}
export default ExampleUsage;