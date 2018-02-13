



var store = new Vuex.Store({
    state: {
        _years: ['',2014, 2015, 2016, 2017, 2018, 2019, 2020],
        _months: ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        _allmembers:["","All Members"],
        _members:[],
        _printdisabled: true,
        _selectmbr:"",
        _selectyr: "",
        _memberreport: false,
        _taxid: "TAX-ID - 11925 9869 RR 0001",
        _memberdata:[],
        _memberTotal:0,
        _norecords: false
    },
    getters:{
        getMembers: function(state){
            return state._allmembers.concat(state._members);
        },
        getYears: function(state){
            return state._years;
        },
        getPrintDisabled: function(state){
            return state._printdisabled;
        },
        getSelectedMember: function(state){
            return state._selectmbr;
        },
        getMemberReport: function(state){
            return state._memberreport;
        },
        getTaxID: function(state){
            return state._taxid;
        },
        getMemberData: function(state){
            return state._memberdata;
        },
        getMonths: function(state){
            return state._months;
        },
        getSelectedYear: function(state){
            return state._selectyr;
        },
        getMemberTotal: function(state){
            var tot = 0;
            state._memberdata.forEach(function(item){
                item.Data.forEach(function(dta){
                    tot += dta.Amount;
                })
            })
            return tot;
        },
        getNoRecords: function (state) {
            return state._norecords;
        }
    },
    mutations:{
        setMembers: function(state, payload){
            state._members = payload;
        },
        setPrintDisabled: function (state, payload) {
            state._printdisabled = payload;
        },
        setSelectedMember: function(state, payload){
            state._selectmbr = payload;
        },
        setSelectedYear: function(state, payload){
            state._selectyr = payload;
        },
        setMemberReport: function (state, payload) {
            state._memberreport = payload;
        },
        setMemberData: function(state, payload){
            state._memberdata = payload;
        },
        setNoRecords: function(state, payload){
            state._norecords = payload;
        }
    },
    actions: {
        queryMemberData: function(context){
            if (context.state._selectyr != "" & context.state._selectmbr != ""){
              axios.get(_spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getbytitle('Revenue Transactions')/items?$select=Member/Title,TransactionType/Title,TransactionDate,Amount&$filter=TransactionDate ge datetime'" + getFinanceStartDate(context.state._selectyr) + "' and TransactionDate le datetime'" + getFinanceEndDate(context.state._selectyr) + "' and Member/Title eq '" + fixedEncodeURIComponent(context.state._selectmbr) + "'&$expand=TransactionType/Id,Member/Id&$orderby=TransactionDate", {
                  headers: { "accept": "application/json;odata=verbose" }
              })
              .then(function(response){
                  var data = [], printrecord = true;
                  context.commit("setNoRecords", false);
                  response.data.d.results.forEach(function(element){
                      var dt = data.filter(function(item){
                        return item.Key == getMonthfromdte(element.TransactionDate);
                      })
                      if (dt.length == 0){
                          mbr = {
                            Key: getMonthfromdte(element.TransactionDate),
                            Data:[
                              {
                                Date: element.TransactionDate,
                                Type: element.TransactionType.Title,
                                Amount: element.Amount
                              }
                            ]
                          }
                          data.push(mbr);
                      }
                      else
                      {
                          $.each(data, function(idx, item){
                              if (item.Key == dt[0].Key)
                              {
                                  mbr = {
                                    Date: element.TransactionDate,
                                    Type: element.TransactionType.Title,
                                    Amount: element.Amount
                                  }
                                  item.Data.push(mbr);
                                  return false;
                              }
                          })
                      }
                  });
                  if (data.length > 0)
                  {
                    context.commit("setMemberData", data);
                    context.commit("setMemberReport", true);
                    printrecord = false;
                  }
                  else
                  {
                    context.commit("setMemberReport", false);
                    context.commit("setMemberData", []);
                    context.commit("setNoRecords", true);
                  }

                  context.commit("setPrintDisabled", printrecord);
              })
            }
        }
    }
})

function getFinanceStartDate(yr) {
  var fdate =  "01/01/" + yr;
  return new Date(fdate).toISOString().substring(0, 10) + "T00:00:00";
}

function getFinanceEndDate(yr) {
  var edate = "12/31/" + yr
  return new Date(edate).toISOString().substring(0, 10) + "T00:00:00";
}

function getMonthfromdte(dte){
    return new Date(dte).getMonth() + 1;
}

function fixedEncodeURIComponent(src) {
  if (src.indexOf("'") > -1)
  {
    return encodeURIComponent(src).replace(/[!'()*]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16) + '%' + c.charCodeAt(0).toString(16);
    });
  }
  return src;
}
