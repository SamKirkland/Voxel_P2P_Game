import React from 'react';
import "./RadioGroup.scss";

interface IRadioGroupProps {

}

export class RadioGroup extends React.PureComponent<IRadioGroupProps> {
    render() {
        return (
            <div className="radioGroup">
                {this.props.children}
            </div>
        );
    }
}

interface IRadioItemProps<valueType> {
    name: string;
    value: valueType;
    checked: boolean;
    onChange: (name: string, value: valueType) => void;
}

export class RadioItem<valueType = string> extends React.Component<IRadioItemProps<valueType>> {
    private handleChange = () => {
        const { onChange, name, value } = this.props;

        onChange(name, value);
    }

    render() {
        const { onChange, children, ...restProps } = this.props;

        return (
            <label tabIndex={0}>
                <input
                    type="radio"
                    onChange={this.handleChange}
                    {...restProps as any}
                />
                <div>
                    {children}
                </div>
            </label>
        );
    }
}