import React, {Component, useState} from 'react';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {isSet} from "../../../../library/utils";

const FormList = (props) => {
    const listClass = "form-list";
    const listGroupClass = "form-list-items";
    const listRowClass = "form-list-row";
    const listItemKeyClass = "form-list-item-key";
    const listItemValueClass = "form-list-item-value";
    const addRowLabel = "Add New";
    const listItemKeyLabel = "Key";
    const listItemValueLabel = "Value";

    let getFormList = [];
    if ((isSet(props.data) && Array.isArray(props.data) && props.data.length > 0)) {
        getFormList = props.data;
    }
    const [formList, setFormList] = useState(getFormList);

    const addFormListRow = (e) => {
        let formListState = [...formList];
        formListState.push(formListRow())
        setFormList(formListState)
    }

    const removeFormListRow = (index, e) => {
        const itemRow = document.getElementsByClassName("list-item-" + index.toString())
        itemRow[0].remove()
        formChangeHandler()
    }

    const formListRow = (index) => {
        return {
            name: "",
            value: ""
        }
    }

    const formChangeHandler = (e) => {
        let listRows = Array.from(document.getElementsByClassName(listRowClass));
        let queryData = [];
        listRows.map((item, index) => {
            let itemKey = item.getElementsByClassName(listItemKeyClass)[0];
            let itemValue = item.getElementsByClassName(listItemValueClass)[0];
            queryData.push({
                name: itemKey.value,
                value: itemValue.value
            })
        })
        props.callback(queryData);
    }
    return (
        <div className={listClass}>
            <button className={"btn btn-primary btn-sm add-row-button"}
                    onClick={addFormListRow}
                    type={"button"}>
                {props.addRowLabel ? addRowLabel : addRowLabel}
            </button>
            <div className={listGroupClass}>
                {formList.map((item, index) => (
                    <div className={listRowClass + " list-item-" + index.toString()}
                         key={index.toString()}>
                        <Row>
                            <Col sm={12} md={12} lg={5}>
                                <input
                                    className={listItemKeyClass}
                                    placeholder={listItemKeyLabel ? listItemKeyLabel : listItemKeyLabel}
                                    defaultValue={item.name}
                                    onChange={formChangeHandler}
                                />
                            </Col>
                            <Col sm={12} md={12} lg={5}>
                                <input
                                    className={listItemValueClass}
                                    placeholder={listItemValueLabel ? listItemValueLabel : listItemValueLabel}
                                    defaultValue={item.value}
                                    onChange={formChangeHandler}
                                />
                            </Col>
                            <Col sm={12} md={12} lg={2}>
                                <a className={"form-list-row--new"} onClick={addFormListRow}><i
                                    className="fas fa-plus-circle"/></a>
                                <a className={"form-list-row--remove"}
                                   onClick={removeFormListRow.bind(this, index)}><i className="fas fa-trash-alt"/></a>
                            </Col>
                        </Row>
                    </div>
                ))}
            </div>
        </div>

    );

}

export default FormList;
