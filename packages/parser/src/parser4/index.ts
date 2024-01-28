// (function jsonGrammarOnlyExample() {
//   // ----------------- Lexer -----------------
//   const createToken = chevrotain.createToken;
//   const Lexer = chevrotain.Lexer;
//
//   const True = createToken({ name: "True", pattern: /true/ });
//   const False = createToken({ name: "False", pattern: /false/ });
//   const LCurly = createToken({ name: "LCurly", pattern: /{/ });
//   const RCurly = createToken({ name: "RCurly", pattern: /}/ });
//   const LSquare = createToken({ name: "LSquare", pattern: /\[/ });
//   const RSquare = createToken({ name: "RSquare", pattern: /]/ });
//   const Comma = createToken({ name: "Comma", pattern: /,/ });
//   const Colon = createToken({ name: "Colon", pattern: /:/ });
//   const Lf = createToken({ name: "LF", pattern: /\n/ });
//   const Semi = createToken({ name: ";", pattern: /;/ });
//   const Command = createToken({ name: "Command", pattern: /Command/ });
//   const ArgS = createToken({ name: " -", pattern: / -/ });
//   const StringLiteral = createToken({
//     name: "StringLiteral", pattern: /(?!(?:true|false|Command)\b)\w+/
//   });
//   const NumberLiteral = createToken({
//     name: "NumberLiteral", pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
//   });
//
//   const Equal = createToken({
//     name: "=",
//     pattern: /=/
//   });
//
//   const webgalTokens = [NumberLiteral, StringLiteral, RCurly, LCurly,
//     LSquare, RSquare, Comma, Colon, True, False, Equal, Command, ArgS, Lf, Semi];
//
//   const WebGalLexer = new Lexer(webgalTokens, {
//     // Less position info tracked, reduces verbosity of the playground output.
//     positionTracking: "onlyStart"
//   });
//
//   // Labels only affect error messages and Diagrams.
//   LCurly.LABEL = "'{'";
//   RCurly.LABEL = "'}'";
//   LSquare.LABEL = "'['";
//   RSquare.LABEL = "']'";
//   Comma.LABEL = "','";
//   Colon.LABEL = "':'";
//
//
//   // ----------------- parser -----------------
//   const CstParser = chevrotain.CstParser;
//
//   class webgalScriptParser extends CstParser {
//     constructor() {
//       super(webgalTokens, {
//         recoveryEnabled: true
//       });
//
//       const $ = this;
//
//       $.RULE("scene", () => {
//         $.MANY_SEP({
//           SEP: Lf, DEF: () => {
//             $.SUBRULE($.sentence);
//           }
//         });
//       });
//
//       $.RULE("sentence", () => {
//         $.OR([
//           { ALT: () => $.SUBRULE($.commonSentence) },
//           { ALT: () => $.SUBRULE($.comment) }
//         ]);
//       });
//
//       $.RULE("commonSentence", () => {
//         $.OR([
//           { ALT: () => $.SUBRULE($.commandSentence) },
//           { ALT: () => $.SUBRULE($.dialog) }
//         ]);
//         $.OPTION(() => {
//           $.CONSUME(Semi);
//         });
//       });
//
//       $.RULE("comment", () => {
//         $.CONSUME(Semi);
//         $.CONSUME(StringLiteral);
//       });
//
//       $.RULE("dialog", () => {
//         $.CONSUME(StringLiteral);
//
//       });
//
//
//       $.RULE("commandSentence", () => {
//         $.CONSUME(Command);
//         $.CONSUME(Colon);
//         $.CONSUME(StringLiteral);
//         $.OPTION(() => {
//           $.SUBRULE($.args);
//         });
//       });
//
//       $.RULE("args", () => {
//         $.CONSUME(ArgS);
//         $.MANY_SEP({
//           SEP: ArgS, DEF: () => {
//             $.SUBRULE($.arg);
//           }
//         });
//       });
//
//       $.RULE("arg", () => {
//         $.CONSUME(StringLiteral);
//         $.CONSUME(Equal);
//         $.SUBRULE($.argv);
//       });
//
//       $.RULE("argv", () => {
//         $.OR([
//           {
//             ALT: () => {
//               this.CONSUME(StringLiteral);
//             }
//           },
//           {
//             ALT: () => {
//               this.CONSUME(NumberLiteral);
//             }
//           },
//           {
//             ALT: () => {
//               this.CONSUME(True);
//             }
//           },
//           {
//             ALT: () => {
//               this.CONSUME(False);
//             }
//           }]);
//       });
//
//       // very important to call this after all the rules have been setup.
//       // otherwise the parser may not work correctly as it will lack information
//       // derived from the self analysis.
//       this.performSelfAnalysis();
//     }
//
//   }
//
//
//   // for the playground to work the returned object must contain these fields
//   return {
//     lexer: WebGalLexer,
//     parser: webgalScriptParser,
//     defaultRule: "scene"
//   };
// }());
export const parser4 = 'unreleased';
