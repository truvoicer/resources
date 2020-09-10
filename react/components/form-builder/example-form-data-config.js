export const FormConfigData = (
    update = false,     //Boolean -Specify if updating data or creating new data
    input_text_field = null,    //field value
    fieldValue1 = null     //field value
) => {
    //Must return an object with a fields array.
    //Fields array must contain array of objects with field data
    return {
        fields: [
            {
                //Field name
                name: "input_text_field",
                //Label shown for field
                label: "Input Text Field Example",
                //Field Type
                //Field type options: text, select, date, checkbox, list
                fieldType: "text",
                //Input type. ie password, email etc.
                type: "text",
                //Placeholder shown for input
                placeHolder: "Enter a key name",
                //Initial value for field
                value: input_text_field? input_text_field : "",
                //Validation rules
                //Options: required, email, alphanumeric, length, password, match(regex pattern)
                validation: {
                    rules: [
                        {
                            type: "alphanumeric"
                        },
                        {
                            type: "length",
                            min: 1,
                            max: 16
                        }
                    ]
                }
            },
            {
                label: "Checkbox Input Example",
                name: "checkbox_input",
                fieldType: "checkbox",
                value: "1",
                checked: checkbox_input,
                checkboxType: "true_false",
                subFields: [
                    {

                        dependsOn: {    // Config for when the sub field should be shown
                            field: "checkbox_input",    // Name of field to check for value
                            value: true     // Value the field has to have to show this sub field
                        },
                        name: "subfield_input",
                        label: "Sub field input Example",
                        type: "text",
                        fieldType: "text",
                        placeHolder: "Enter extra data to append",
                        value: subfield_input? subfield_input : ""
                    },
                ]
            },
            {
                label: "List item?",    //Array list field
                name: "list_item",
                fieldType: "list",
            },
            {
                name: "select_field",
                label: "Select Field Example",
                fieldType: "select",
                multi: false,   //Multiple selection or single
            },
        ]
    }
}