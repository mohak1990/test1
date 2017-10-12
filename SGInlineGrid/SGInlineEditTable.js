var React    = require('react')
var ReactDOM = require('react-dom');
var $ = require('jquery')   

var classNames = require('classnames');

var resolveUrl = require("resolve-url") 
var scripts = document.getElementsByTagName("script");
var root = scripts[scripts.length-1];
var publicPath = resolveUrl(root.src, '../../../');
__webpack_public_path__ = publicPath;

require('./SGInlineEditTable.css');
var _ = require('underscore');
import ContextMenu from './ContextMenu/ContextMenu';
var sort = true;
var resolveUrl = require("resolve-url");
var scripts = document.getElementsByTagName("script");
var root = scripts[scripts.length-1];
//var sortAsc = resolveUrl(root.src, '../../../Images/sort_asc.gif');
//var sortDesc = resolveUrl(root.src, '../../../Images/sort_desc.gif');
var undo = resolveUrl(root.src, '../../../Images/undo.png');
var Pagination = require('./Pagination/pagination.js').PaginationComponent;
require('./Pagination/Pagination.css'); 
var RowComponent = require("./RowComponent");
var CheckComp = require("../checkBox");
import StickyGrid from "./StickyGrid"

var InlineTableComponent = React.createClass({
      
    propTypes: {

        id: React.PropTypes.any.isRequired,
        idProperty: React.PropTypes.any.isRequired,
        dataSource: React.PropTypes.any.isRequired,
        SGcolumns: React.PropTypes.any.isRequired,

        onClick : React.PropTypes.func,
        onDoubleClick : React.PropTypes.func,
        showTooltip: React.PropTypes.bool,
        onRowUpdate :  React.PropTypes.func,
        
        height: React.PropTypes.node,
        width: React.PropTypes.node,
        pagination: React.PropTypes.bool,
        resultsPerPage: React.PropTypes.number,
        contextItems: React.PropTypes.array,
    }, 

    getDefaultProps: function () {
          
        return {
                showTooltip: false,
                pagination: false,
                resultsPerPage: 25,
                contextItems: [],
                selectedIndex : -1
        };
    },

    getInitialState: function(){

    return { 
            idProperty: this.props.idProperty,
            dataSource : this.props.dataSource || [],
            dataSourceCopy : [],
            currRow: {},
            rowValidated: false,
            SGcolumns : this.props.SGcolumns || [],
            toolTip : "",
            id: this.props.id,  
            pagination : this.props.pagination || false, 
            resultsPerPage : this.props.resultsPerPage || 25,
            index : -1,
            rowObj : {},
            absIndex : -1,
            absIndexCheck : [],
            showRecordsBy : "bypage",
            currPageNo: 1,
            selectedPgNo: -1,
            isInit : true,
            multiSelect: this.props.multiSelect,
            checkAll : false,
            rowState : [],
            selectedRows : [],
            isDataFiltered: false,
            isColGroup : this.isColGroup(),
            fixedCols : this.props.fixedCols || false,
            hasVerScroll: false,
            hasFooterColData : this.hasFooterColData(),
            displayTooltip : false,
            toolTipStyle: {visibility: 'hidden'}
        }
    },
     
    componentWillMount(){
       // alert(this.props.selectedIndex)
        this.state.index = this.props.selectedIndex;
    },


    componentDidMount: function(){
         
        var rowState = [];
        if(this.props.dataSource != undefined)
        {
            this.state.pagination = this.props.pagination,
            this.state.resultsPerPage = this.props.resultsPerPage,
            
            this.state.dataSourceCopy = this.props.dataSource;
            
            if(this.state.pagination)
            this.refs.Pagination.state.renderPagination = true;

            for(var i = 0; i < this.props.dataSource.length; i++) {
                    
                rowState[i] = false;
            }
            
            if(this.refs["rowComponent" + 0] != undefined)
            {
                for(var i = 0; i < this.props.dataSource.length; i++) {
            
                    this.refs["rowComponent" + i].state.rowState = false;
                    this.refs["rowComponent" + i].state.EditMode = false;
                    this.refs["rowComponent" + i].forceUpdate();
                }
            }
            
            this.setState({rowState: rowState});

            if(this.props.selectedIndex != undefined && this.props.selectedIndex != -1)
            {   
                let rowIndex = this.props.selectedIndex;
                
                let rowObj = this.state.dataSource[rowIndex];
                let rowId = rowObj[this.props.idProperty];
                let rowControl = eval("this.refs.rowComponent" + rowIndex);

                this.setSelectedIndex(rowIndex, rowId, rowObj, rowControl);
            }
        }

        $(document).keydown(function(e){
            
//            if(e.which == 13 || e.which == 9) //on pressing enter key or tab key
//            {
//                this.saveCurrentRow(function(data){});
//            }

        }.bind(this));
    },

    //can be called externally to save
    saveCurrentRow: function(success){ 
        
        this.state.rowValidated = this.beforeUpdateRow();
//        
//        if(!this.state.rowValidated)
//            return false;
        
        
        if(this.state.index == -1)
        {
            if(typeof success == "function")
                success(this.state.dataSourceCopy);
            return;
        }
        if(this.state.index != -1 && this.state.rowValidated)
        {
            this.updateRow(function(data){ 
                if(typeof success == "function")
                    success(data);
            });
            
            if(this.state.rowValidated && this.state.gridRow != undefined)
            {   
                this.state.gridRow.state.rowObj = this.state.currRow; //update the gridRow(selected row) with updated Row
                this.setRowEditMode(this.state.gridRow, false);
                
                $('.dubbedTableBodyContainer table.SGTableBody tr').removeClass("SGTableRowSelected");
                
                this.state.index = -1;
                //this.state.absIndex = -1;
                this.state.rowId = -1;
                
                if(this.props.pagination)
                    this.refs.Pagination.forceUpdate();
            }
        }
    },

    componentWillReceiveProps: function(nextProp){
        
        const $this = this;
        var selIndex = nextProp.selectedIndex;
        var prevIndex = this.state.index;
        
        var isColGroup = this.isColGroup(nextProp);
        if(nextProp.dataSource != undefined)
        {   
            this.setState({
                    dataSource: nextProp.dataSource,
                    dataSourceCopy : nextProp.dataSource,
                    SGcolumns : nextProp.SGcolumns, 
                    selectedRows : [], 
                    absIndexCheck : [],
                    isColGroup : isColGroup,
                    pagination : this.props.pagination,
                    resultsPerPage : this.props.resultsPerPage,
                    checkAll : false
                    
                }, function(){ 
                     
                    if(prevIndex != selIndex)
                    {   
                        if(prevIndex == -1)
                        {     
                            this.setRowClickEvent(selIndex);
                            this.state.rowValidated = true;
                        }
                        if(selIndex == -1)
                        {
                            this.setState({index : selIndex});
                        }
                        else
                        {    
                            if(this.state.rowValidated)
                            { 
                             
                                $this.setRowClickEvent(selIndex);
                            }
                        }
                    }
            });
            
            if(this.state.gridRow != undefined && selIndex==-1)
             this.state.gridRow.state.EditMode = false;
            
            if(this.state.pagination)
            this.refs.Pagination.state.renderPagination = true;

            if(this.state.multiSelect){
                
                var rowState = [];
                
                for(var i = 0; i < nextProp.dataSource.length; i++) {
                    
                    rowState[i] = false;
                }
                
                if(this.refs["rowComponent" + 0] != undefined)
                {    
                    for(var i = 0; i < nextProp.dataSource.length; i++) {
                        
                        if(this.refs["rowComponent" + i] != undefined)
                        {
                            this.refs["rowComponent" + i].state.rowState = false;
                            this.refs["rowComponent" + i].state.EditMode = false;
                            this.refs["rowComponent" + i].forceUpdate();
                        }
                    }
                }
                
                this.setState({rowState: rowState, index : -1});
            }
        }
    },
    
    shouldComponentUpdate: function(nextProp, nextState)
    {     
          return nextState.dataSource != this.state.dataSource || 
                nextState.toolTip != this.state.toolTip || 
                nextState.toolTipStyle != this.state.toolTipStyle || 
                nextProp.SGcolumns != this.props.SGcolumns || 
                this.state.multiSelect != nextProp.multiSelect || 
                this.state.checkAll != nextState.checkAll ||
                this.state.dataSourceCopy != nextState.dataSourceCopy ||
                this.state.rowObj != nextState.rowObj ||
                this.state.rowState != nextState.rowState ||
                this.state.index != nextState.index ||
                this.state.selectedIndex != nextState.selectedIndex
    },

    componentDidUpdate: function(){
        
        this.setHdrVerScroll();
        
    },

    
    onRowUpdate: function(data, oldRowObj, currRowObj){
        
        if(this.props.onRowUpdate)
        {
            this.props.onRowUpdate(data, oldRowObj, currRowObj);
        }
    },

    updateCurrRow : function(rowObj){
        
        this.state.currRow = rowObj;
    },

    beforeUpdateRow: function(){
        
        if(this.props.beforeUpdate) // if user Validation exists
        {   
            var data = this.state.dataSource.slice();
            var oldRow = data[this.state.index];
            var currRow = this.state.currRow;
            return this.props.beforeUpdate(oldRow, currRow, data, this.state.index);
        }
        else
        {  
            return true; // if no validation 
        }
    },
    
    updateRow: function(success){
            
        if(this.state.index == -1) return; //there is no row to save
        //if (this.state.rowValidated = this.beforeUpdateRow())
        {   
            var data = this.state.dataSource.slice();
            var dataCopy = this.state.dataSourceCopy.slice();

            var oldRow = dataCopy[this.state.absIndex];
         
            var currRow = JSON.parse(JSON.stringify(this.state.currRow));
            
            dataCopy[this.state.absIndex] = currRow;
            data[this.state.index] = currRow;
            
            this.state.dataSource = data;                     //updated dataSource with modified Row
            this.state.dataSourceCopy = dataCopy;             //updated dataSourceCopy with modified Row

            if(this.props.fixedCols)
            {
                this.selStkyColRow(this.state.index);
            }
            
            this.onRowUpdate(dataCopy, oldRow, currRow);
            
            if(typeof success == "function")
                success(dataCopy);
        }
    },
     
    onRowClick: function(rowIndex, rowId, rowObj, rowControl){ 
         
        this.updateRow(function(data){ });
         
        var $this = this;
        
        //proceed only if validation succeeded OR was there nothing to validate(first row select)
        if (this.state.rowValidated || this.state.index == -1 )
        {
            //get the rowComponent which was being edited
            var gridRow = this.state.gridRow;
            
            //not on first row select
            if(gridRow != undefined && this.state.index != -1)
            {   
                //update the row control state with new data
                gridRow.state.rowObj = this.state.dataSource[this.state.index];

                if(this.state.multiSelect)
                gridRow.state.rowState = this.state.rowState[this.state.index]; //multiselect
                //end the edit mode of row control
                
                this.setRowEditMode(this.state.gridRow, false); //prev Row (forceUpdate)
            }
            this.setRowEditMode(rowControl, true); //curr Row (forceUpdate)

            this.state.currRow = JSON.parse(JSON.stringify(this.state.dataSource[rowIndex]));
             
            this.state.absIndex = ( this.state.resultsPerPage * (this.state.currPageNo - 1) ) + rowIndex;
            
            this.state.index = rowIndex;

            this.state.gridRow = rowControl;
            //this.state.rowValidated = false;
            this.state.rowId = rowId;
            this.state.rowObj = rowObj;

            if(this.props.contextMenu)
            {
                this.refs.ContextMenu.state.currRow = rowObj;
                this.refs.ContextMenu.forceUpdate();
            }
            
            if(this.props.fixedCols)
                this.selStkyColRow(rowIndex);
        } 
    },

    setSelectedIndex : function(rowIndex, rowId, rowObj, rowControl){
            
            this.state.rowValidated = this.beforeUpdateRow();

            if(this.props.onClick != undefined && this.state.rowValidated)
            {
                
                this.props.onClick(rowIndex, rowObj, this.state.dataSource);
            }
    },

    selStkyColRow : function(rowIndex){
        
        var row = $('.dubbedTableBodyContainer table.SGTableBody tr').eq(rowIndex + 1)[0];
        $(row).addClass("SGTableRowSelected").siblings().removeClass("SGTableRowSelected");
    },

    onRowDoubleClick : function(rowObj)
    {
        if(this.props.onDoubleClick)
        this.props.onDoubleClick(rowObj);
    },

    onStkyRowDoubleClick : function(rowObj)
    {
        if(this.props.onDoubleClick)
            this.props.onDoubleClick(rowObj);
    },

    setRowEditMode : function(rowControl, editMode)
    {       
            rowControl.state.EditMode = editMode;
            rowControl.forceUpdate();
    },

    showTooltip : function(rowIndex, colIndex, toolTipText, rowObj, col){
        
        //show tooltip only where ellipses exist
         
        if(col.customTooltip != undefined)   
            toolTipText = col.customTooltip(rowObj);
 
        var element = $(`.SGTableTD-${rowIndex}-${colIndex}`)
            .clone()
            .css({display: 'inline', width: 'auto', visibility: 'hidden'})
            .appendTo('body');

        if(col.customTooltip != undefined || this.props.showTooltip && element.width() > $(`#${this.props.id} .SGTableTD-${rowIndex}-${colIndex}`).width() )
        {
            var pos = $(`.SGTableTD-${rowIndex}-${colIndex}`).position();
            

            var toolTipStyle = {left: pos.left, 
                                top: pos.top + 20,    
                                display: 'inline', 
                                visibility: 'visible',
                                position: 'absolute', 
                                padding:'1px', 
                                border: "1px solid black", 
                                width: "auto",
                                backgroundColor: "#ffffe0"};
            
            if(this.props.showTooltip)
                this.setState({displayTooltip : true, toolTip : toolTipText, toolTipStyle : toolTipStyle});
        }

        element.remove();
    },

    hideTooltip : function(){
          
            if(this.props.showTooltip)
                this.setState({ toolTipStyle : {...this.state.toolTipStyle, visibility: 'hidden'} });
    },

    setPageFilteredData: function(pageFilteredData, pageNumber, showRecBy, resultsPerPage){
        
        this.setHdrVerScroll();
        this.saveCurrentRow(function(data){});
        this.state.isDataFiltered = true;
        this.setState({ dataSource: pageFilteredData, showRecordsBy: showRecBy, 
                        currPageNo: pageNumber, resultsPerPage: resultsPerPage }, function() {
           
           // maintaining multiselect checks for pagination
           if(showRecBy == "ByPage")
           {
               var rowState = []; 
               if(this.props.pagination && this.props.multiSelect)
               {    
                    if(this.state.checkAll)
                    {   
                        for(var i = 0; i < resultsPerPage; i++) 
                        {
                            rowState[i] = this.state.checkAll;
                            this.refs["rowComponent" + i].state.rowState = this.state.checkAll;
                            this.refs["rowComponent" + i].forceUpdate();
                        }
                    }
                    else
                    {
                        pageFilteredData.forEach(function(rowObj, index){
            
                            var rowComp = "rowComponent"+index;
                            this.refs[rowComp].state.rowState = false;
                            this.refs[rowComp].state.EditMode = false;
                            this.refs[rowComp].forceUpdate();

                            this.state.absIndexCheck.forEach(function(item, i){
                
                                var rowChkIndex = item - this.state.resultsPerPage * (pageNumber - 1);
                     
                                if(rowChkIndex > -1 && rowChkIndex <= this.state.resultsPerPage - 1)
                                {   
                                    var rowComp = "rowComponent" + rowChkIndex;
                                    this.refs[rowComp].state.rowState = true;
                                    this.refs[rowComp].forceUpdate();
                                }

                            }.bind(this));
                        }.bind(this));
                    }
                 }
            }
            else
            {   
                pageFilteredData.forEach(function(rowObj, index){
            
                    var rowComp = "rowComponent" + index;
                    this.refs[rowComp].state.rowState = false;
                    this.refs[rowComp].state.EditMode = false;
                    this.refs[rowComp].forceUpdate();

                    this.state.absIndexCheck.forEach(function(absIndex, index){
                         
                        var rowComp = "rowComponent"+absIndex;
                        this.refs[rowComp].state.rowState = true;
                        this.refs[rowComp].forceUpdate();

                    }.bind(this))

                }.bind(this))
            }
        }.bind(this));
    },
      
    afterClick: function(){
        
        var currRow = this.state.currRow;
            
        if(this.props.afterClick)
        this.props.afterClick(currRow);
    },

    //must call externally
    multiSelect: function(isMultiSelect){
        
        var rowState = []; 
        for(var i = 0; i < this.state.dataSource.length; i++) 
        {
            this.refs["rowComponent" + i].state.multiSelect = isMultiSelect;
            this.refs["rowComponent" + i].state.rowState = false;
            this.refs["rowComponent" + i].state.EditMode = false;
            
            this.refs["rowComponent" + i].forceUpdate();
        }

        for(var i = 0; i < this.state.dataSourceCopy.length; i++) 
        {
            rowState[i] = false;
        }
         
        if(this.props.selectedRows)
        {   
            var selectedRows = [];
            this.state.selectedRows = [];
            this.state.absIndexCheck = [];
            this.props.selectedRows(selectedRows) //reset selectedRows 
        }
         

        this.setState({multiSelect: isMultiSelect, selectedRows: [], rowState: rowState, checkAll : false, index : -1 });
        this.saveCurrentRow(function(data){});
    },

    onCheckAll: function(){

        var checkAll = !this.state.checkAll;
        var rowState = [];
        var selectedRows = [];
        var data = this.state.dataSource.slice();
        var dataCopy = this.state.dataSourceCopy.slice();
        
        if(!this.state.pagination)
        {   
            var data = this.state.dataSource.slice();
            for(var i = 0; i < data.length; i++) 
            {
                rowState[i] = checkAll;
                this.refs["rowComponent" + i].state.rowState = checkAll;
                this.refs["rowComponent" + i].forceUpdate();
                selectedRows.push(data[i][this.props.idProperty]);
            }
        }
        
        if(checkAll)
        {   
            
            this.state.absIndexCheck = [];
            for(var i = 0; i < data.length; i++) 
            {
                this.refs["rowComponent" + i].state.rowState = checkAll;
                this.refs["rowComponent" + i].forceUpdate();
                
            }
            for(var i = 0; i < dataCopy.length; i++) 
            {
                rowState[i] = checkAll;
                this.state.absIndexCheck.push(i);
            }
             
            selectedRows = _.pluck(dataCopy, [this.props.idProperty]);
        }
        else
        {   
            for(var i = 0; i < data.length; i++) 
            {
                this.refs["rowComponent" + i].state.rowState = checkAll;
                this.refs["rowComponent" + i].forceUpdate();
            }

            for(var i = 0; i < dataCopy.length; i++) 
            {
                rowState[i] = checkAll;
            }

            selectedRows = [];
            this.state.absIndexCheck = []
        }

        this.setState({
              rowState: rowState,
              checkAll: checkAll,
              selectedRows: selectedRows
        });

        if(this.props.selectedRows)
        {
            this.props.selectedRows(selectedRows) //all  
        }
    },

    setCheck: function(rowIndex, isCheck, rowObj){
        
        var id = rowObj[this.props.idProperty];

        //pagn
        var absIndexCheck = (this.state.resultsPerPage * (this.state.currPageNo - 1)) + rowIndex;
        this.state.rowState[absIndexCheck] = isCheck;

        
        var rowComp = "rowComponent"+rowIndex;
        this.refs[rowComp].state.rowState = isCheck;

        
        //provide user with selected rows
        if(isCheck)
        {
            this.state.selectedRows.push(id);
            
            //pagn
            if(this.state.pagination)
            this.state.absIndexCheck.push(absIndexCheck);
        }
        else
        {   
            var arrIndex = this.state.selectedRows.indexOf(id);  
            if(arrIndex > -1)
            {
                this.state.selectedRows.splice(arrIndex, 1);
            }

            //pagn
            if(this.state.pagination)
            var absIndexChk = this.state.absIndexCheck.indexOf(absIndexCheck);

            if(absIndexChk > -1)
            {
                this.state.absIndexCheck.splice(absIndexChk, 1);
            }
        }
        
        if(this.props.selectedRows)
        {
            this.props.selectedRows(this.state.selectedRows) //id as props
        }

        //handle checkALL checkbox(header)
        if(this.state.checkAll == true){ 
            
            if(isCheck == false)
            {
                this.setState({checkAll: false});
                this.forceUpdate();
            }
        }
        else
        {   
            
            var checkAll = true;
            for(var i = 0; i < this.state.dataSourceCopy.length; i++) {
              
                if(this.state.rowState[i] == false)
                { 
                     checkAll = false;
                     return;
                }
            }
             
            this.setState({checkAll: checkAll});
        }
    },
     
    isColGroup : function(nextProp){
        
        var hasProp = false;
        var props = {};
        if(nextProp)
            props = nextProp;
        else
            props = this.props;
        props.SGcolumns.map(function(col, i){
            if(col.hasOwnProperty("groupName")){
                
                hasProp = true;
            }
        });
        return hasProp;
    },
    
    hasFooterColData : function(){
        
        var hasProp = false;
        this.props.SGcolumns.map(function(col, i){
            if(col.hasOwnProperty("footerData")){
                
                hasProp = true;
            }
        });
        return hasProp;
    },
    
    groupColumns : function(){
        
        var grpCols = _.pluck(this.props.SGcolumns, "groupName");
        var obj = _.countBy(grpCols, _.identity);
        return obj;
    },

    onScroll : function(e){
         
        var source = e.target;
        var target = $(".dubbedTableBodyContainer")[0];
        $(target).prop("scrollTop", source.scrollTop);
    },

    onStkyRowClick : function(rowIndex){
        
        let rowObj = this.state.dataSource[rowIndex];
        let rowId = rowObj[this.props.idProperty];
        let rowControl = eval("this.refs.rowComponent" + rowIndex);

        this.setSelectedIndex(rowIndex, rowId, rowObj, rowControl);
    },
    
    //called by ComponentWillReceiveProps
    setRowClickEvent : function(rowIndex){
         
        let rowObj = this.state.dataSource[rowIndex];
        let rowId = rowObj[this.props.idProperty];
        let rowControl = eval("this.refs.rowComponent" + rowIndex);
         
        this.onRowClick(rowIndex, rowId, rowObj, rowControl);
    },

    scrollHeader : function(e){
        
        var source = e.target;
        var target = $(`#${this.props.id}.dubbedTableBodyContainer`)[0];
        $(target).prop("scrollTop", source.scrollTop);

        var target = $(`#${this.props.id}.SGTableHeaderScroll`)[0];
        $(target).prop("scrollLeft", source.scrollLeft);

        var target = $(`#${this.props.id}.footerScroll`)[0];
        $(target).prop("scrollLeft", source.scrollLeft);
    },
    
    setHdrVerScroll : function(){

        var tblBody = ReactDOM.findDOMNode(this.refs.hasScroll)
        var hasVerScroll = tblBody.scrollWidth > tblBody.clientWidth;
        
        this.state.hasVerScroll = hasVerScroll;
    },

    render: function(){
      
       
       var $this = this;
       var isAnyChkBoxDisable = false;
       
       var rows = [];
       var stkyCols = [];
       
       if(this.state.isDataFiltered || !this.state.pagination)
       {
           rows = this.state.dataSource.map(function(obj, i){
        
                var rowId = obj[$this.props.idProperty];
                //setting row style
                var rowStyle = undefined;
                if($this.props.rowStyle != undefined)
                {
                    rowStyle = $this.props.rowStyle(obj);
                }
        
                if(!isAnyChkBoxDisable)
                {
                    isAnyChkBoxDisable = obj[$this.props.chkBoxDisable];
                }
                
                return(
                         <RowComponent key={i} ref={"rowComponent" + i}  afterClick={$this.afterClick} updateCell = {$this.updateCell}
                            EditMode = {$this.state.index == i} onRowClick = {$this.setSelectedIndex } onRowDoubleClick = {$this.onRowDoubleClick} SGcolumns = {$this.state.SGcolumns} 
                            idProperty={$this.props.idProperty} rowObj={Object.assign({}, obj)} rowId = {rowId} index={i} 

                            showTooltip={$this.showTooltip} 
                            hideTooltip={$this.hideTooltip}

                            multiSelect={$this.state.multiSelect == true} 
                            updateCurrRow={$this.updateCurrRow}
                          
                            currRow = {$this.state.currRow}
                            rowState={$this.state.rowState[i]} 
                            setCheck={(index, isCheck, rowObj)=>$this.setCheck(index, isCheck, rowObj)}
                            chkBoxDisable = {obj[$this.props.chkBoxDisable]} 
                            rowStyle = {rowStyle}
                            TextWrap = {$this.props.TextWrap}
                            rowToolTip={$this.props.rowToolTip}
                        />
                )
            });
        }
         
        return(
           
            <div ref="SGInlineEditTable" className='SGInlineEditTable' id={this.props.id} style={{background : '#f5f5f5', position: "relative"}}>
                
                {this.state.fixedCols ?
                    <StickyGrid 
                        id={this.props.id}
                        rowStyle={this.props.rowStyle} 
                        height={this.props.height} 
                        rowStyle={this.props.rowStyle} 
                        groupColumns={this.groupColumns} 
                        fixedCols={this.state.fixedCols} 
                        SGcolumns={this.props.SGcolumns} 
                        dataSource={this.props.dataSource} 
                        isColGroup={this.state.isColGroup} 
                        showTooltip={this.showTooltip}
                        hideTooltip={this.hideTooltip}
                        onRowClick={this.onStkyRowClick}
                        onDoubleClick={this.onStkyRowDoubleClick}
                      />
                    :
                    null
                }

                {this.props.contextMenu == true ?
                <ContextMenu 
                    ref="ContextMenu"
                    contextID={this.props.id}
                    items={this.props.contextItems}
                />
                : null}
                <div id={this.props.id} className="SGTableHeaderScroll" style={{width: this.props.width, position:"absolute", overflow: "hidden"}}>
                    <table className= {(this.props.Mode && this.props.Mode.toLowerCase() == "dblist")?"SGTableHeader": "SGGridHeader"}cellSpacing="0px" cellPadding="0px" width= "100%">
                        <thead>
                            <tr>
                                {$this.state.multiSelect ? (
                                    <td style={{ textAlign:"center", width: "30px"}} className="multiSelectCol">
                                    </td>
                                ): null}
                                {$this.state.SGcolumns.map(function(col, i){ 
                                     
                                var colhidden = (typeof col.hidden == "function") ? col.hidden(): col.hidden;
                                        return (
                                            colhidden != true ? (
                                                <td style={{ textAlign: 'center', width: col.width  }} key = {i}></td>
                                            ):null
                                        )
                                    })
                                }
                            </tr>

                            {$this.state.isColGroup ? (
                                <tr rowSpan="1" className="SGTableHeaderTR CommonHeader">
                                {  
                                    Object.keys($this.groupColumns()).map(function(key, i) {
                                         
                                        return (
                                            <td style={{ textAlign:"center"}} colSpan={$this.groupColumns()[key]}>
                                                {key != "undefined" ? key : ""}
                                            </td>
                                        )
                                    })
                                }
                                <td>
                                </td>
                                </tr>
                            ):null}

                            <tr className="SGTableHeaderTR">
                                {$this.state.multiSelect ? (
                                    <td style={{ textAlign:"center", width:"30px"}} className="multiSelectCol">
                                        {(!isAnyChkBoxDisable && this.state.dataSource.length > 0 && this.state.multiSelect ) ?
                                            <CheckComp id="checkAll" checked={this.state.checkAll} onChange={(isCheck)=>this.onCheckAll(isCheck)}/>
                                            :
                                            null
                                        }
                                    </td>
                                ): null}
                                {$this.state.SGcolumns.map(function(col, i){ 
                                            
                                        var colhidden = (typeof col.hidden == "function") ? col.hidden(): col.hidden;
                                            
                                        return (
                                            
                                            colhidden != true ? (
                                                <td style={{ textAlign: 'center', width: $this.state.SGcolumns[i].width }} key = {i}>
                                                    <span>
                                                        {typeof $this.props.SGcolumns[i].title == "function" ? $this.props.SGcolumns[i].title() : $this.props.SGcolumns[i].title }
                                                    </span>
                                                    <span>
                                                        <img id='sortAsc' style={{ display: 'none', position:'absolute', marginTop: '2px' }}  /> 
                                                        <img id='sortDesc' style={{ display: 'none', position:'absolute', marginTop: '2px' }} /> 
                                                    </span>
                                                </td> 
                                            )
                                            : null
                                        )
                                    })
                                }
                                
                                
                                {this.state.hasVerScroll ?
                                <td style={{maxWidth:'20px'}}> 
                                </td>
                                : null}

                                <td>
                                </td>
                            </tr>
                        </thead>
                    </table>
                </div>
                <div style={{height:'20px'}}>
                </div>
                {this.state.isColGroup ? 
                    <div style={{height:'24px'}}>
                    </div>
                : null}

                <div className="SGTableContainer" ref="hasScroll" style={{width: this.props.width, maxHeight: parseInt(this.props.height), height: parseInt(this.props.height), overflowY: 'auto' }} onScroll={(e)=>this.scrollHeader(e)}>
                    <table className="SGTableContainer" cellSpacing="0" cellPadding="0px">
                        <tbody>
                            <tr>
                                <td>
                                    <div className='SGTableBodyContainer'>
                                        <table id='SGTableBody' className='SGTableBody' cellSpacing="0" cellPadding="0" style = {{width: "100%", tableLayout:'fixed'}} >
                                            <tbody>
                                                <tr style={{height: "0px"}} >
                                            
                                                    {$this.state.multiSelect? (
                                                        <td style={{ textAlign:"center", width:"30px" }} className="multiSelectCol">
                                                        </td>
                                                    ): null}

                                                    {$this.state.SGcolumns.map(function(col, i){
                                                        var colhidden = (typeof col.hidden == "function") ? col.hidden(): col.hidden;
                                                        return(
                                                            colhidden != true ? (
                                                                <td style={{ width: col.width }}> 
                                                                </td>
                                                            ): null
                                                         )
                                                      })
                                                    }
                                                    <td></td>
                                                </tr>
                                        
                                                {rows}
                                                
                                            </tbody>
                                        </table>
                                       
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div id={this.props.id} className= "footerScroll" style = {{width: this.props.width, maxWidth: this.props.width, overflowX: "hidden"}}>
                    {$this.state.hasFooterColData ? (
                    <table className="SGTableColFooter">
                        <tbody>
                            <tr style={{height: "20px", backgroundColor: "#f7f7f7"}}>
                                {$this.state.SGcolumns.map(function(col, i){
                                     
                                    var colhidden = (typeof col.hidden == "function") ? col.hidden(): col.hidden;
                                    var footerData = (typeof col.footerData == "function") ? col.footerData(): col.footerData;
                                    
                                    return(
                                        colhidden != true ? (
                                                <td style={{ width: col.width, minWidth: col.width }}>
                                                    {footerData}
                                                </td>

                                            ): null
                                        )
                                    })
                                }
                                <td></td>
                            </tr>
                        </tbody>
                    </table> ) : null }

                    {$this.props.footerData ? (
                    <div className="SGTableFooter">
                        {typeof ($this.props.footerData == "function") ? $this.props.footerData(): $this.props.footerData}
                    </div> ) : null }
                    
                </div>
              
                <div id="dbListTip" className="toolTip" style={this.state.toolTipStyle} >
                    {this.state.toolTip}
                </div>
                
                {this.state.pagination ? (
                    <Pagination TableID={this.props.id} ref='Pagination' dataSource = {$this.state.dataSourceCopy.slice()} resultsPerPage = {$this.state.resultsPerPage} setPageFilteredData={$this.setPageFilteredData} />
                ) : null }

           </div>
          )
      }
 })


 export default InlineTableComponent;
