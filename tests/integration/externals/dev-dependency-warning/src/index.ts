import leftPad from 'left-pad';
import leftPadLib from 'left-pad/lib';
import 'normalize.css';

export const primary = leftPad('foo', 5, ' ');
export const secondary = leftPadLib;
