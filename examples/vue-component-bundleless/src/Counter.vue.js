/// <reference types="../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref } from 'vue';
import CounterButton from './CounterButton.vue';
const count = ref(0);
const increment = () => count.value++;
const decrement = () => count.value--;
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "counter-text" },
});
(__VLS_ctx.count);
/** @type {[typeof CounterButton, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(CounterButton, new CounterButton({
    ...{ 'onClick': {} },
    label: "-",
}));
const __VLS_1 = __VLS_0({
    ...{ 'onClick': {} },
    label: "-",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onClick: (__VLS_ctx.decrement)
};
var __VLS_2;
/** @type {[typeof CounterButton, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(CounterButton, new CounterButton({
    ...{ 'onClick': {} },
    label: "+",
}));
const __VLS_8 = __VLS_7({
    ...{ 'onClick': {} },
    label: "+",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
let __VLS_10;
let __VLS_11;
let __VLS_12;
const __VLS_13 = {
    onClick: (__VLS_ctx.increment)
};
var __VLS_9;
/** @type {__VLS_StyleScopedClasses['counter-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CounterButton: CounterButton,
            count: count,
            increment: increment,
            decrement: decrement,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
