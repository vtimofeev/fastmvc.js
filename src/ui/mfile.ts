module ui.def {
    import TemplateView = ft.TemplateView;
    export var MFile = {
        className: 'ui.MFile',
        content: '<div .base="group" ' +
        ' class="{state.base} {state.custom}" ' +
        //  ' .children.selected="{this.isSelected(current)}" ' +
        ' .children.base="file" ' +
        ' .children.class="ui.File" ' +
        //    ' .children.hover="{cc.childIndex===state.hoverIndex}" ' +
        //' .children.onaction="item">' +
        '</div>',
        mixin: {


            validateChildren() {
                this.childrenVMData && this.childrenVMData.forEach( (v:TemplateView, k)=>v.setState('value', this.model.data[k]) );
            },


            internalHandlerImpl: function (e:fmvc.IEvent) {
                var data = e && e.target && (e.target.model || e.target.data);
            }
        }

    }
}
