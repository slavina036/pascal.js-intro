import { Addition } from '../SyntaxAnalyzer/Tree/Addition';
import { Multiplication } from '../SyntaxAnalyzer/Tree/Multiplication';
import { Subtraction } from '../SyntaxAnalyzer/Tree/Subtraction';
import { Division } from '../SyntaxAnalyzer/Tree/Division';
import { NumberConstant } from '../SyntaxAnalyzer/Tree/NumberConstant';
import { NumberVariable } from './Variables/NumberVariable';
import { UnaryMinus } from '../SyntaxAnalyzer/Tree/UnaryMinus';
import { Assignment } from '../SyntaxAnalyzer/Tree/Assignment';
import { Variable } from '../SyntaxAnalyzer/Tree/Variable';

export class Engine
{
    /**
     * Результаты вычислений (изначально - один для каждой строки)
     * 
     * @type string[]
     */
    results;

    constructor(trees)
    {
        this.trees = trees;
        this.results = [];
        this.variablestorage = {};
    }

    run()
    {
        let self = this;

        this.trees.forEach(

            function(tree)
            {
                //console.dir(tree, {depth:null})
                let result = self.evaluateSimpleExpression(tree);
                // console.log(result.value);
                self.results.push(result.value); // пишем в массив результатов
            }
        );

    }

    evaluateSimpleExpression(expression)
    {
        if (expression instanceof Addition ||
                expression instanceof Subtraction) {

            let leftOperand = this.evaluateSimpleExpression(expression.left);
            let rightOperand = this.evaluateSimpleExpression(expression.right);

            let result = null;
            if (expression instanceof Addition) {
                result = leftOperand.value + rightOperand.value;
            } else if (expression instanceof Subtraction) {
                result = leftOperand.value - rightOperand.value;
            }

            return new NumberVariable(result);
        } else {
            return this.evaluateTerm(expression);
        }
    }

    evaluateTerm(expression)
    {
        if (expression instanceof Multiplication) {
            let leftOperand = this.evaluateSimpleExpression(expression.left);
            let rightOperand = this.evaluateSimpleExpression(expression.right);

            let result = leftOperand.value * rightOperand.value;

            return new NumberVariable(result);
        } else if (expression instanceof Division) {
            let leftOperand = this.evaluateSimpleExpression(expression.left);
            let rightOperand = this.evaluateSimpleExpression(expression.right);
            let result = leftOperand.value / rightOperand.value;

            return new NumberVariable(result);
        } else if (expression instanceof Assignment) {
            let rightOperand = this.evaluateSimpleExpression(expression.right);
            let result = rightOperand.value;
            this.variablestorage[expression.left.symbol.value] = result;

            return new NumberVariable(result);
        
        } else {
            return this.evaluateMultiplier(expression);
        }
    }

    evaluateMultiplier(expression)
    {
        if (expression instanceof NumberConstant) {
            return new NumberVariable(expression.symbol.value);
        } else if (expression instanceof UnaryMinus) {
            let operand = this.evaluateTerm(expression.operand);
            let result = operand.value * (-1) ;

            return new NumberVariable(result);

        } else if (expression instanceof Variable) {
            let operand = expression.symbol.value;
            if (this.variablestorage[operand] === undefined) { 
                throw `"The value of the variable "${operand}" is not set`;
            } else {
                let result = this.variablestorage[operand];
                return new NumberVariable(result);
            }

        } else {
            throw 'Number Constant expected.';
        }
    }
};