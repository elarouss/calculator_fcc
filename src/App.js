import React, { Component } from 'react';
import {createStore, applyMiddleware} from 'redux';
import {connect,Provider} from 'react-redux';
import thunk from 'redux-thunk';
import './App.css';

const INPUT_DIGIT = 'INPUT_DIGIT';
const INPUT_DECIMAL = 'INPUT_DECIMAL';
const INPUT_OPERATOR = 'INPUT_OPERATOR';
const CLEAR = 'CLEAR';
const CALCULATE = 'CALCULATE';

const inputDigit = (digit) => {
  return {type : INPUT_DIGIT, digit};
};

const inputDecimal = () => {
  return {type : INPUT_DECIMAL};
};

const inputOperator = (operator) => {
  return {type : INPUT_OPERATOR, operator};
};

const clear = () => {
  return {type : CLEAR};
};

const calculate = () => {
  return {type : CALCULATE};
};

const defaultState =
  {formula : "0",
   display : "0",
   result: 0,
   lastIsOperator : false,
   hasDecimal : false,
   calculated : false};

const reducer = (state = defaultState, action) => {
  let newState = Object.assign({},state);
  switch (action.type) {
    case CLEAR :
      return defaultState;

    case INPUT_DIGIT :
      if (newState.calculated) {
        newState.formula = "" + action.digit;
        newState.display = "" + action.digit;
        newState.result = 0;
      }else{
        newState.lastIsOperator = false;
        const length = state.formula.length;
        // get the last digit entered to check if it is a zero
        // in tha tcase, the new digit should replace it
        // the state.display = "0" is to avoid messing with numbers
        // that have zero as non first
        if (state.display == "0" &&
             state.formula.substring(length-1,length) == "0"){
          // replace the zero with the new digit
          newState.formula = state.formula.substring(0,length-1)
                              + action.digit;
          newState.display = action.digit;
        }else{
          // the formula is updated with every digit entered
          newState.formula = state.formula + action.digit;
          // the display is updated according to whether the last input is an operator or not
          if (state.lastIsOperator)
            newState.display = "" + action.digit;
          else
            newState.display = state.display + action.digit;
        }
      }
      //set the calculated flag to false
      newState.calculated = false;
      return newState;

    case INPUT_OPERATOR :
      newState.lastIsOperator = true;
      // allow using decimal point for the next number
      newState.hasDecimal = false;
      // in case the last thing entered was another operator, replace it with the new one
      if (state.lastIsOperator) {
        const length = state.formula.length;
        newState.formula = state.formula.substring(0,length - 1)
                            + action.operator;
      }else{ // otherwise just append it
        // in case of chaining operations, we need to update the formula
        // with the previous result
        if (state.calculated){
          newState.formula = ""+state.result + action.operator;
        }else{
          newState.formula = state.formula + action.operator;
        }
      }
      // display the new entered operator
      newState.display = "" + action.operator;

      // set the calculated flag to false
      newState.calculated = false;
      return newState;

    case INPUT_DECIMAL :
      if (!state.hasDecimal) {
        newState.display = state.display + ".";
        newState.formula = newState.formula + ".";
        newState.hasDecimal = true;
        newState.calculated = false;
      }
      return newState;

    case CALCULATE :
        if (!state.lastIsOperator){
          const result = eval(state.formula);
          newState.display = result;
          newState.result = result;
          newState.hasDecimal = false;
          newState.lastIsOperator = false;
          newState.calculated = true;
        }
        return newState;
    default:
      return state;
  }
};

const store = createStore(reducer);


class Display extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return (
      <div>
        <div id="formula">
          {this.props.formula}
        </div>
        <div id="display">
          {this.props.display}
        </div>
      </div>
    );
  }

}

class Button extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return(
      <button id={this.props.id} onClick={this.props.handleClick}>
        {this.props.value}
      </button>
    );
  }
}


class Calculator extends Component {
  constructor(props){
    super(props);
  }
  render(){
    const inputOperator = (op) => this.props.inputOperator(op);
    const inputDigit = (dg) => { this.props.inputDigit(dg);}
    const display = this.props.display;
    let formula = (this.props.calculated)?
      this.props.formula+"="+this.props.result: this.props.formula;
    return (
      <div id="calculator">
        <Display formula={formula} display={display}/>
        <div id="buttons">
          <Button handleClick={() => inputOperator("/")} id="divide" value="/"/>
          <Button handleClick={() => inputOperator("*")} id="multiply" value="*"/>
          <Button handleClick={() => inputOperator("+")} id="add" value="+"/>
          <Button handleClick={() => inputOperator("-")} id="subtract" value="-"/>
          <Button handleClick={() => inputDigit("7")} id="seven" value="7"/>
          <Button handleClick={() => inputDigit("8")} id="eight" value="8"/>
          <Button handleClick={() => inputDigit("9")} id="nine" value="9"/>
          <Button handleClick={this.props.clear} id="clear" value="AC"/>
          <Button handleClick={() => inputDigit("4")} id="four" value="4"/>
          <Button handleClick={() => inputDigit("5")}id="five" value="5"/>
          <Button handleClick={() => inputDigit("6")}id="six" value="6"/>
          <Button handleClick={() => inputDigit("1")} id="one" value="1"/>
          <Button handleClick={() => inputDigit("2")}id="two" value="2"/>
          <Button handleClick={() => inputDigit("3")}id="three" value="3"/>
          <Button handleClick={this.props.calculate} id="equals" value="="/>
          <Button handleClick={() => inputDigit("0")}id="zero" value="0"/>
          <Button handleClick={this.props.inputDecimal} id="decimal" value="."/>
        </div>
      </div>
    );
  }
}

const mapStatetoProps = (state) => {
  return {formula : state.formula,
          display: state.display,
          result: state.result,
          calculated: state.calculated,
          lastIsOperator: state.lastIsOperator};
};

const mapDispatchToProps = (dispatch) => {
  return {
    inputDigit: (digit) => {
      dispatch(inputDigit(digit));
    },
    inputDecimal: () => {
      dispatch(inputDecimal());
    },
    inputOperator: (operator) => {
      dispatch(inputOperator(operator));
    },
    calculate: () => {
      dispatch(calculate());
    },
    clear: () => {
      dispatch(clear());
    }
  };
};

const Container = connect(mapStatetoProps,mapDispatchToProps)(Calculator);

class App extends Component {
  render() {
    return (
      <div id="app">
        <Provider store={store}>
          <Container />
        </Provider>
        <footer>
          <div>Designed And Coded By</div>
          <a href="https://www.github.com/elarouss">
            Oussama El Arbaoui
          </a>
          <div>&copy;  2018</div>
        </footer>
      </div>
    );
  }
}

export default App;
