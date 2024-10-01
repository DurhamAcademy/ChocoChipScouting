# Components

## Background

When designing this software, we were faced with a problem. How do we allow for maximum customization year to year 
while still keeping the routine maintenance as low as possible?

_Our solution: Custom Components._

Using Vue, we have created a selection of custom components that can be used just like any other HTML element when 
designing each years scouting page. You don't HAVE to use these, but you don't have a lot of time to figure out how 
to customize this software to fit your needs, these components make year to year changes much more cookie cutter.

## Introduction to Components

Navigate to the 'Components' directory inside your project. Notice how the components are organized.
- Season specific components are labeled with the _year_ and then the _season's name_ (ex: 24-crescendo)
- Components for the scouting page are in the 'scouting-components' folder
- Other component folders are created to decrease clutter

Open the SingleSelect.vue file inside the scouting-components folder

Notice how components work:

```
const props = defineProps<{
  modelValue: number;
  options: Array<String>;
}>();

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})
```

Props are like parameters of a function. These allow you to provide data to the component. Meanwhile, the modelValue 
(the emit) acts like a return value of a function. This allows you to output data from the component back into a 
script you use it in. 

For the Single Select file, the options prop is used to define 