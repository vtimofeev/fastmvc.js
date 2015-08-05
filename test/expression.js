var fromTo = {
    "{data.prop}" : { vars: ["data.prop"], source: "{data.prop}"},
    "{data.prop.op}" : true, // optimized
    "{data.prop} text": "$0 text", // optimized with text
    "{(data.prop||data.value)} text": { exLink: "e0"}, // expression
    "{data as V, (data) as A|i18n} io ho ho": { exLink: "e1"}, // expression
    "{getState('hover')}": {exLink: "e1"}
};