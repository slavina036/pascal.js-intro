import { Multiplication } from './Tree/Multiplication';
import { Division } from './Tree/Division';
import { Addition } from './Tree/Addition';
import { Subtraction } from './Tree/Subtraction';
import { NumberConstant } from './Tree/NumberConstant';
import { SymbolsCodes } from '../LexicalAnalyzer/SymbolsCodes';
import { UnaryMinus } from './Tree/UnaryMinus';
import { Variable } from './Tree/Variable';
import { Engine } from '../Semantics/Engine';
import { Assignment } from './Tree/Assignment';

/**
 * Синтаксический анализатор - отвечат за построения дерева выполнения
 */
export class SyntaxAnalyzer
{
    constructor(lexicalAnalyzer)
    {
        this.lexicalAnalyzer = lexicalAnalyzer;
        this.symbol = null;
        this.previousSymbol = null;
        this.tree = null;
        this.trees = [];    
    }

    nextSym()
    {
        this.previousSymbol = this.symbol;
        this.symbol = this.lexicalAnalyzer.nextSym();
    }

    accept(expectedSymbolCode)
    {
        if (this.symbol.symbolCode === expectedSymbolCode) {
                this.nextSym();
        } else {
            throw `"${expectedSymbolCode}" expected but "${this.symbol.symbolCode}" found!`;
        }
    }

    analyze()
    {
        this.nextSym();

        while (this.symbol !== null) {
            let expression = this.scanExpression();
            this.trees.push(expression);

            // Последняя строка может не заканчиваться переносом на следующую строку.
            if (this.symbol !== null) {
                this.accept(SymbolsCodes.endOfLine);
            }

        }

        return this.tree;
    }
    // Разбор выражения
    scanExpression()
    {
        let term = this.scanTerm();
        let operationSymbol = null;

        while (this.symbol !== null && (
            this.symbol.symbolCode === SymbolsCodes.plus ||
            this.symbol.symbolCode === SymbolsCodes.minus ||
            (this.symbol.symbolCode === SymbolsCodes.equals && term.symbol.symbolCode === SymbolsCodes.identifier)
        )) {

            operationSymbol = this.symbol;
            this.nextSym();

            switch (operationSymbol.symbolCode) {
                case SymbolsCodes.plus:
                    term = new Addition(operationSymbol, term, this.scanTerm());
                    break;
                case SymbolsCodes.minus:
                    term = new Subtraction(operationSymbol, term, this.scanTerm());
                    break;  
                case SymbolsCodes.equals:
                    term = new Assignment(operationSymbol, term, this.scanExpression());
            }
        }

        return term;
    }
    // Разбор слагаемого
    scanTerm()
    {
        let term = this.scanMultiplier();
        let operationSymbol = null;

        while ( this.symbol !== null && (
                    this.symbol.symbolCode === SymbolsCodes.star ||
                    this.symbol.symbolCode === SymbolsCodes.slash 
        )) {

            operationSymbol = this.symbol;
            this.nextSym();

            switch (operationSymbol.symbolCode) {
                case SymbolsCodes.star:
                    term = new Multiplication(operationSymbol, term, this.scanMultiplier());
                    break;
                case SymbolsCodes.slash:
                    term = new Division(operationSymbol, term, this.scanMultiplier());
                    break;
            }
        }

        return term;
    }

    // Разбор множителя
    scanMultiplier()
    {
         if (this.symbol.symbolCode === SymbolsCodes.minus ) {
            let sym = this.symbol;
            this.nextSym();
            return new UnaryMinus(sym, this.scanMultiplier());

         } else if (this.symbol.symbolCode === SymbolsCodes.leftPar) {
            this.nextSym();
            let expression = this.scanExpression();
            this.accept(SymbolsCodes.rightPar);
            return expression;

        } else if (this.symbol.symbolCode === SymbolsCodes.identifier) {   // переменная
            let identifier = this.symbol;           
            this.accept(SymbolsCodes.identifier);
            return new Variable(identifier);

        } else {
            let integerConstant = this.symbol;

            this.accept(SymbolsCodes.integerConst);

            return new NumberConstant(integerConstant);
        }

    };

};