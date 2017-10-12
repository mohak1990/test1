var React  = require('react');
var $ = require('jquery');
require('./Pagination.css');
var SGDropDown = require('../../SGDropDown/SGDropDown.js');

module.exports = {
    
    PaginationComponent : React.createClass({
    
        getInitialState: function(){
         
            return{
                //dataSource: [],
                dataSourceUpdated: [],
                resultsPerPage : this.props.resultsPerPage,
                filteredData : [],
                currentPage : 1,
                txtPageNo : 1,
                showRecordsBy : "ByPage",
                showAll : false,
                noOfPages : "", 
                renderPagination : true,
                pagingOptions: [{label: 10, value: 10}, {label: 25, value: 25}, {label: 50, value: 50} ]
            }
        },

        componentDidMount: function(){
             
            if(this.props.dataSource != undefined && this.props.dataSource.length > 0)
            {   
                var maxRecords = this.props.dataSource.length;
                this.state.maxPageNo = (maxRecords % this.state.resultsPerPage) > 0 ? parseInt(maxRecords / this.state.resultsPerPage) + 1 : parseInt(maxRecords / this.state.resultsPerPage);
            }
        },
        
        componentWillReceiveProps: function(nextProps){
            
            this.setState({dataSourceUpdated: nextProps.dataSource.slice()});
            
            if(nextProps.dataSource.length > 0)
            {   
                var maxRecords = nextProps.dataSource.length;
                this.state.maxPageNo = (maxRecords % this.state.resultsPerPage) > 0 ? parseInt(maxRecords / this.state.resultsPerPage) + 1 : parseInt(maxRecords / this.state.resultsPerPage);
            }
        },

        shouldComponentUpdate(nextProps, nextState){
        
            return nextState.dataSourceUpdated != this.state.dataSourceUpdated ||
                   nextState.currentPage != this.state.currentPage ||
                   nextState.showAll != this.state.showAll ||
                   nextProps.dataSource != this.props.dataSource
        },

        componentDidUpdate: function(prevProps, prevState){
             
            if(prevProps.dataSource.length != this.props.dataSource.length || this.state.renderPagination )
            {   
                this.state.currentPage = 1;
                this.state.renderPagination = false;

                //this.setState({dataSourceUpdated: this.props.dataSource});
                this.bindDataGrid(this.state.showAll, this.props.dataSource);
            }
        },

        bindDataGrid: function(showAll, dataList){
            var $this = this;
            if(!this.state.showAll && dataList != null && dataList.length > 0 && dataList.length > this.state.resultsPerPage){
                
                var maxRecords = dataList.length;
                
                this.state.noOfPages = (maxRecords % this.state.resultsPerPage) > 0 ? parseInt(maxRecords / this.state.resultsPerPage) + 1 : parseInt(maxRecords / this.state.resultsPerPage);
    
                var counterStartVal = (this.state.currentPage - 1) * this.state.resultsPerPage;          //from
                var totalRecords = this.state.currentPage * this.state.resultsPerPage;                   //to

                var filteredList = dataList.slice(counterStartVal, totalRecords);                        //slicing current data
                
                this.props.setPageFilteredData(filteredList, this.state.currentPage, this.state.showRecordsBy, this.state.resultsPerPage);
            }
            else
            {   
                this.props.setPageFilteredData(dataList, this.state.currentPage, this.state.showRecordsBy, this.state.resultsPerPage);
                this.state.noOfPages = 1; this.state.currentPage = 1;  
            }
            
            $this.setGridFooter();
        },

        firstButtonClick: function(e) {
            
            e.preventDefault();
            var isBtnDisabled = $("#" + this.props.TableID + " #btnFirst").hasClass("disabledItem");
            if(!isBtnDisabled) {
                this.state.currentPage = 1; 
                this.bindDataGrid(false, this.state.dataSourceUpdated);
            }
        },

        backButtonClick: function(e) {
            
            e.preventDefault();
            var isBtnDisabled = $("#" + this.props.TableID + " #btnBack").hasClass("disabledItem");
            if(!isBtnDisabled) { 
             
                this.state.currentPage = parseInt(this.refs.txtPageNo.value) - 1;
                this.bindDataGrid(false, this.state.dataSourceUpdated);
            }
        },

        forwardButtonClick: function(e) {
           
            e.preventDefault();
            var isBtnDisabled = $("#" + this.props.TableID + " #btnForward").hasClass("disabledItem");
            if(!isBtnDisabled) {
                this.state.currentPage = parseInt(this.refs.txtPageNo.value) + 1;
                this.bindDataGrid(false, this.state.dataSourceUpdated);
            }
        },

        lastButtonClick: function(e) {
            
            e.preventDefault();
            var isBtnDisabled = $("#" + this.props.TableID + " #btnLast").hasClass("disabledItem");
            if(!isBtnDisabled) {
                this.state.currentPage = this.state.maxPageNo;
                this.bindDataGrid(false, this.state.dataSourceUpdated);
            }
        },

        showOptionButtonClick: function(){ 
            
            var $this = this;
            if(this.state.showRecordsBy.toLowerCase() == "bypage"){
            
                this.state.showRecordsBy = "All";
                this.state.showAll = true;
                $("#" + this.props.TableID + " #FooterPager").hide();
                $("#" + this.props.TableID + " .ddlPaging").hide();
                $("#" + this.props.TableID + " #btnShowOption")[0].innerHTML = " ByPage ";
                this.bindDataGrid(true, this.state.dataSourceUpdated);

            } else { 
                 
                this.state.currentPage = 1;
                this.state.showRecordsBy = "ByPage";
                this.state.showAll = false;
                $("#" + this.props.TableID + " #FooterPager").show();
                $("#" + this.props.TableID + " .ddlPaging").show();
                $("#" + this.props.TableID + " #btnShowOption")[0].innerHTML = " All ";
                this.bindDataGrid(false, this.state.dataSourceUpdated);
            }
        },

        setGridFooter: function() {
            
            var $this = this;
            //$("#txtPageNo").val(this.state.currentPage);
            //this.refs.txtPageNo.value = this.state.currentPage;
            //$("#spanNoOfPgs")[0].innerHTML = this.state.noOfPages;
            //this.refs.spanNoOfPgs.value = this.state.noOfPages;
            
            if (this.state.noOfPages == 1) {
                $("#" + this.props.TableID + " #btnFirst").addClass("disabledItem");
                $("#" + this.props.TableID + " #btnBack").addClass("disabledItem");
                $("#" + this.props.TableID + " #btnForward").addClass("disabledItem");
                $("#" + this.props.TableID + " #btnLast").addClass("disabledItem");
            } else if(this.state.currentPage == 1) {
                $("#" + this.props.TableID + " #btnFirst").addClass("disabledItem");
                $("#" + this.props.TableID + " #btnBack").addClass("disabledItem");
                $("#" + this.props.TableID + " #btnForward").removeClass("disabledItem");
                $("#" + this.props.TableID + " #btnLast").removeClass("disabledItem");
            } else if (this.state.currentPage == this.state.noOfPages) {
                $("#" + this.props.TableID + " #btnFirst").removeClass("disabledItem");
                $("#" + this.props.TableID + " #btnBack").removeClass("disabledItem");
                $("#" + this.props.TableID + " #btnForward").addClass("disabledItem");
                $("#" + this.props.TableID + " #btnLast").addClass("disabledItem");
            } else {
                $("#" + this.props.TableID + " #btnFirst").removeClass("disabledItem");
                $("#" + this.props.TableID + " #btnBack").removeClass("disabledItem");
                $("#" + this.props.TableID + " #btnForward").removeClass("disabledItem");
                $("#" + this.props.TableID + " #btnLast").removeClass("disabledItem");
            }
        },
          
        pgNoBlurEvent: function() {
             
            var enteredPgNo = this.refs.txtPageNo.value;
             
            if(enteredPgNo != this.state.txtPageNo){
                
                if(enteredPgNo == "")
                {
                    enteredPgNo = 1;
                }
                
                this.state.currentPage = enteredPgNo;
                this.state.txtPageNo = enteredPgNo; 
                 
                this.bindDataGrid(false, this.state.dataSourceUpdated);
            }
        },

        onChangeNoText: function(e){
            
            var enteredPgNo = this.refs.txtPageNo.value;
            enteredPgNo = enteredPgNo.replace(/[^0-9]/g, ''); //only numbers
            
            if(enteredPgNo != "")
            {
                if(enteredPgNo < 1)
                {
                    enteredPgNo = 1;
                }
                else if(enteredPgNo > this.state.maxPageNo)
                {
                    enteredPgNo = this.state.maxPageNo;
                }
            }
            
            this.setState({currentPage: enteredPgNo});
        },

        selectPageOption: function(selObj){

            this.setState({resultsPerPage: selObj.value, currentPage: 1, txtPageNo : 1}, function(){
             
               this.bindDataGrid(false, this.state.dataSourceUpdated);

            }.bind(this));
        },

        render: function(){
        
          return( 
                <div>
                  <table id="FooterRow" className="SGridFooter" cellSpacing="0px" cellPadding="0px">
                    <tbody>
                        <tr>
                            <td style={{height: "23px"}}>
                                <div style={{position: "relative", width: "100%", height: "100%"}}>
                                    <table style={{position: "fixed", left: "0px", margin:"3px"}}>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <span>
                                                        Show : <a id="btnShowOption" className="clearSearch" style={{width: "20px"}} onClick={this.showOptionButtonClick}>All</a>
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{marginLeft: "5px"}}>
                                                        <SGDropDown
                                                            id="ddlPaging"
                                                            className="ddlPaging"
                                                            options={this.state.pagingOptions}
                                                            onChange={this.selectPageOption}
                                                            label="label"
                                                            value="value"
                                                            selectedValue={this.state.resultsPerPage}
                                                            disabled= {false}
                                                        />
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                            
                            <td style={{height: "23px"}}>
                                <div style={{position: "relative", width: "100%", height: "100%"}}>
                                    <span style={{position: "fixed", left: "0px", margin:"1px"}}>
                                        <table style={{position: "fixed", right:"0px"}}  id="FooterPager" cellSpacing="0px" cellPadding="0px">
                                            <tbody>
                                            <tr>
                                                <td>
                                                    
                                                </td>
                                                <td style={{width:"18px", textAlign:"right"}}>
                                                    <a id="btnFirst" style={{height: "17px", width:"17px", borderWidth: "0px", padding: "3px", backgroundColor: "transparent"}} 
                                                        onClick={this.firstButtonClick} className="ToolBarItem" href="#" >
                                                        <div style={{height: "16px", width: "16px"}} className="firstImageButton" title="First" id="tbcPlaceList_imgNew"></div>
                                                    </a>
                                                </td>
                                                <td style={{width:"18px", textAlign:"right"}}>
                                                    <a id="btnBack" style={{height: "17px", width:"17px", borderWidth: "0px", padding: "3px", backgroundColor: "transparent"}}
                                                        onClick={this.backButtonClick} className="ToolBarItem" href="#" >
                                                        <div style={{height: "16px", width: "16px"}} className="backImageButton" title="Previous" id="tbcPlaceList_imgNew"></div>
                                                    </a>
                                                </td>
                                                <td style={{width:"35px", textAlign:"right"}}>
                                                    Page
                                                </td>
                                                <td style={{width:"5px"}}>
                                                </td>
                                                <td style={{width:"30px", textAlign:"right"}}>
                                                   <input type="text" ref="txtPageNo" id="txtPageNo" className="STextBox"
                                                          onChange={this.onChangeNoText} onBlur={this.pgNoBlurEvent} value={this.state.currentPage} />
                                                </td>
                                                <td style={{width:"15px", textAlign:"center"}}>
                                                    of
                                                </td>
                                                <td style={{width:"20px", textAlign:"center"}}>
                                                   <span style={{fontWeight:"bold"}}>
                                                        {this.state.noOfPages}
                                                   </span>
                                                </td>
                                                <td style={{width:"18px", textAlign:"right"}}>
                                                    <a id="btnForward" style={{height: "17px", width:"17px", borderWidth: "0px", padding: "3px", backgroundColor: "transparent"}}
                                                        onClick={this.forwardButtonClick} className="ToolBarItem" href="#" >
                                                        <div style={{height: "16px", width: "16px"}} className="forwardImageButton" title="Next" id="tbcPlaceList_imgNew"></div>
                                                    </a>
                                                </td>
                                                <td style={{width:"18px", textAlign:"right"}}>
                                                    <a id="btnLast" style={{height: "17px", width:"17px", borderWidth: "0px", padding: "3px", backgroundColor: "transparent"}}
                                                        onClick={this.lastButtonClick} className="ToolBarItem" href="#" >
                                                        <div style={{height: "16px", width: "16px"}} className="lastImageButton" title="Last" id="tbcPlaceList_imgNew"></div>
                                                    </a>
                                                </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                    </span>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
             </div>
            )
         } 
      })
}