export const FormConfigData = (
    update = false,     //Boolean -Specify if updating data or creating new data
    fieldValue2 = null,    //field value
    fieldValue1 = null     //field value
) => {
    //Must return an object with a fields array.
    //Fields array must contain array of objects with field data
    return {
        fields: [
            {
                //Field name
                name: "key_name",
                //Label shown for field
                label: "Key Name",
                //Field Type
                //Field type options: text, select, date, checkbox, list
                fieldType: "text",
                //Input type. ie password, email etc.
                type: "text",
                //Placeholder shown for input
                placeHolder: "Enter a key name",
                //Initial value for field
                value: fieldValue2? fieldValue2 : "",
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
        ]
    }
}