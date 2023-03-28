sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/List",
	"sap/m/StandardListItem"
], function (Controller, JSONModel, MessageBox, Dialog, Button, MobileLibrary, Text, TextArea, List, StandardListItem) {
	"use strict";

	return Controller.extend("com.hariss.dpbs.DailyProductionBeverageSummaryFinal.controller.Worklist", {

		/*1.On Intial loading - Present Year & Present Year-2 is being set to From & To
		2.Setting a Dropdown for Plant - onSuccess -Binding first 4 Records and calling onSearch function for
	      loading GraphData
	    3.Setting Dropdown for Card 1*/
		onInit: function () {
			var that = this;
			this.getView().byId("DP1").setValue(new Date().getFullYear() - 2);
			this.getView().byId("DP2").setValue(new Date().getFullYear());
			this.getOwnerComponent().getModel().read("/PlantsSet", {
				success: function (data) {
					var PlantModel = new JSONModel(data.results);
					that.getView().setModel(PlantModel, "PlantModel");
					if (data.results.length > 4) {
						that.getView().byId("combobox1").setSelectedKeys([data.results[0].Werks, data.results[1].Werks, data.results[2].Werks, data.results[
							3].Werks]);
						that.onWerksChange();
					}
				},
				error: function (response) {}
			});
			this.getOwnerComponent().getModel().read("/PQMaterialGroupSet", {
				success: function (data) {
					var PQMatModel = new JSONModel(data.results);
					that.getView().setModel(PQMatModel, "PQMatModel");
					if (data.results.length > 4) {
						that.getView().byId("IdItem1").setSelectedKeys([data.results[0].Mvgr1, data.results[1].Mvgr1, data.results[2].Mvgr1, data.results[
							3].Mvgr1]);
					}
					that.getRecordsPQ();
				},
				error: function (response) {}
			});
			this.getMaterialGroups();

		},
		getMaterialGroups: function () {
			var that = this;
			this.getOwnerComponent().getModel().read("/PYMaterialGroupSet", {
				success: function (data) {
					var PYMatModel = new JSONModel(data.results);
					that.getView().setModel(PYMatModel, "PYMatModel");
					if (data.results.length > 4 && that.getView().byId("IdItem4").getVisible() === true) {
						that.getView().byId("IdItem3").setSelectedKeys([data.results[0].Matkl, data.results[1].Matkl, data.results[2].Matkl, data.results[
							3].Matkl]);
					} else {
						that.getView().byId("IdItem3").setSelectedKeys(data.results[0].Matkl);
					}
					that.onMGChange();

				},
				error: function (response) {}
			});
		},
		/*	1. This function invokes automatically when the user changes anything in Plant Dropdown */
		onWerksChange: function (oEvent) {
			var WerksKey = this.getView().byId("combobox1").getSelectedKeys(),
				that = this;
			if (WerksKey.length > 4) {
				var Items = this.getView().byId("combobox1").getSelectedItems();
				this.getView().byId("combobox1").setValueState("Error");
				this.getView().byId("combobox1").setValueStateText("Please Select 4 Items only");
				this.getView().byId("combobox1").removeSelectedItem(Items[Items.length - 1]);
			} else {
				this.getView().byId("combobox1").setValueState("None");
				this.getView().byId("combobox1").setValueStateText("");
				var Plantfilters = [];
				for (var i = 0; i < WerksKey.length; i++) {
					var aFilter = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, WerksKey[i]);
					Plantfilters.push(aFilter);
				}
				this.getOwnerComponent().getModel().read("/WorkCenterListSet", {
					filters: Plantfilters,
					success: function (data) {
						if (data.results.length > 4) {
							that.getView().byId("IdItem2").setSelectedKeys([data.results[0].Arbpl, data.results[1].Arbpl, data.results[2].Arbpl, data.results[
								3].Arbpl]);
						}
						var WerksModel = new JSONModel(data.results);
						WerksModel.setSizeLimit(data.results.length);
						that.getView().setModel(WerksModel, "WERKS_MODEL");
						if (!oEvent) {
							that.getRecordsEF();
						}
					}
				});
			}
		},
		onSelectChangeM: function (oEvent) {
			var Items = oEvent.getSource().getSelectedItems();
			if (oEvent.getSource().getId().includes("IdItem3") && this.getView().byId("IdItem4").getVisible() === false && Items.length > 1) {
				oEvent.getSource().setValueState("Error");
				oEvent.getSource().removeSelectedItem(Items[Items.length - 1]);
				oEvent.getSource().setValueStateText("Please Select 1 Item only in case of search by Material group");
			}
			if (oEvent.getSource().getId().includes("IdItem3") && this.getView().byId("IdItem4").getVisible() === true && Items.length > 4) {
				oEvent.getSource().setValueState("Error");
				oEvent.getSource().removeSelectedItem(Items[Items.length - 1]);
				oEvent.getSource().setValueStateText("Please Select 4 Items only");
			} else {
				oEvent.getSource().setValueState("None");
				oEvent.getSource().setValueStateText("");
			}
		},
		onSearchWithMatGrp: function () {
			if (this.getView().byId("idBtn3").getPressed()) {
				this.getView().byId("IdItem4").setVisible(false);
				this.getMaterialGroups();
				var TimePeriod = this.getView().byId("combo2").getSelectedKey();
				if (TimePeriod === "QT") {
					this.getView().byId("IdItem6").setVisible(true);
					this.getView().byId("IdItem5").setVisible(false);
				} else if (TimePeriod === "MT") {
					this.getView().byId("IdItem5").setVisible(true);
					this.getView().byId("IdItem6").setVisible(false);
				} else {
					this.getView().byId("IdItem5").setVisible(false);
					this.getView().byId("IdItem6").setVisible(false);
				}
				this.getView().byId("idBtn3").setText("Search with Material Group by material");
			} else {
				this.getView().byId("IdItem4").setVisible(true);
				this.getMaterialGroups();
				this.getView().byId("IdItem5").setVisible(false);
				this.getView().byId("IdItem6").setVisible(false);
				this.getView().byId("idBtn3").setText("Search with Material Group");
			}
		},
		onSearchWithMatGrp1: function () {
			this.getView().byId("IdItem4").setVisible(false);
			this.getMaterialGroups();
			var TimePeriod = this.getView().byId("combo2").getSelectedKey();
			if (TimePeriod === "QT") {
				this.getView().byId("IdItem6").setVisible(false);
				this.getView().byId("IdItem5").setVisible(true);
			}
			if (TimePeriod === "MT") {
				this.getView().byId("IdItem5").setVisible(true);
				this.getView().byId("IdItem6").setVisible(false);
			}
		},
		onSearchWithMat: function () {
			this.getView().byId("IdItem4").setVisible(true);
			this.getMaterialGroups();
		},
		/*	1. This function invokes automatically when the user changes anything in MaterialGroup Dropdown in Card 3*/
		onMGChange: function (oEvent) {
			var MGKeys = this.getView().byId("IdItem3").getSelectedKeys(),
				that = this,
				Items;
			if (this.getView().byId("IdItem4").getVisible() === true && MGKeys.length > 4) {
				Items = this.getView().byId("IdItem3").getSelectedItems();
				this.getView().byId("IdItem3").setValueState("Error");
				this.getView().byId("IdItem3").setValueStateText("Please Select 4 Items only");
				this.getView().byId("IdItem3").removeSelectedItem(Items[Items.length - 1]);
			} else if (this.getView().byId("IdItem4").getVisible() === false && MGKeys.length > 1) {
				Items = this.getView().byId("IdItem3").getSelectedItems();
				this.getView().byId("IdItem3").setValueState("Error");
				this.getView().byId("IdItem3").setValueStateText("Please Select 1 Item only");
				this.getView().byId("IdItem3").removeSelectedItem(Items[Items.length - 1]);
			} else {
				this.getView().byId("IdItem3").setValueState("None");
				this.getView().byId("IdItem3").setValueStateText("");

				//	if (this.getView().byId("IdItem4").getVisible() === true) {
				var MGfilters = [];
				for (var i = 0; i < MGKeys.length; i++) {
					var aFilter = new sap.ui.model.Filter("Matkl", sap.ui.model.FilterOperator.EQ, MGKeys[i]);
					MGfilters.push(aFilter);
				}
				this.getOwnerComponent().getModel().read("/PYMaterialSet", {
					filters: MGfilters,
					success: function (data) {
						if (data.results.length > 4) {
							that.getView().byId("IdItem4").setSelectedKeys([data.results[0].Matnr, data.results[1].Matnr, data.results[2].Matnr, data.results[
								3].Matnr]);
						}
						var MatModel = new JSONModel(data.results);
						MatModel.setSizeLimit(data.results.length);
						that.getView().setModel(MatModel, "MAT_MODEL");
						//	if (!oEvent) {
						that.getRecordsPY();
						//	}
					}
				});
				/*	} else {
						that.getRecordsPY();
					}*/
			}
		},
		/*	1. This is will be triggered when Go is clicked on Filter Bar, Validation is implemented 
			2.if the button is explicitly clicked by the user it asks for confirmation
			3.Else it directly displays the graph data*/
		onSearch: function (oEvent) {
			var sMandit = true;
			if (this.getView().byId("combobox1").getSelectedKeys() === "") {
				sMandit = false;
				this.getView().byId("combobox1").setValueState("Error");
			} else {
				this.getView().byId("combobox1").setValueState("None");
			}
			if (this.getView().byId("DP1").getValue() === "") {
				sMandit = false;
				this.getView().byId("DP1").setValueState("Error");
			} else {
				this.getView().byId("DP1").setValueState("None");
			}
			if (this.getView().byId("DP2").getValue() === "") {
				sMandit = false;
				this.getView().byId("DP2").setValueState("Error");
			} else {
				this.getView().byId("DP2").setValueState("None");
			}
			if (this.getView().byId("combo2").getValue() === "") {
				sMandit = false;
				this.getView().byId("combo2").setValueState("Error");
			} else {
				this.getView().byId("combo2").setValueState("None");
			}
			if (!sMandit) {
				sap.m.MessageBox.show("Please select Mandatory Fields", sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			} else if (this.getView().byId("combobox1").getSelectedItems().length > 4) {
				sap.m.MessageBox.show("Please select only four Plants", sap.m.MessageBox.Icon.ERROR, "Error");
			} else if (oEvent) {
				/*	this.setStates("IdItem1");
					this.setStates("IdItem2");
					this.setStates("IdItem3");
					this.setStates("IdItem4");*/
				var SelectedItems = this.getView().byId("combobox1").getSelectedItems();
				var SelItemsArr = [];
				SelectedItems.forEach(function (element) {
					var newObj = {
						key: element.getProperty("key"),
						text: element.getProperty("text")
					};
					SelItemsArr.push(newObj);
				});
				this.goToConfirmDialog(SelItemsArr);
			} else {
				this.getRecordsPQ();
			}

		},
		/*	1.This function sets the ValueState and Text as None, It recieves Id as Parameter*/
		setStates: function (Id) {
			this.getView().byId(Id).setValueState("None");
			this.getView().byId(Id).setValueStateText("");
		},
		/*	1. ConfirmDialog when the user clicks on Search Button - It asks for the confirmation to proceed*/
		goToConfirmDialog: function (SelItems) {
			var SelItemModel = new JSONModel(SelItems);
			sap.ui.getCore().setModel(SelItemModel, "SelItemModel");
			if (!this.oConfirmDialog) {
				this.oConfirmDialog = new Dialog({
					contentWidth: "30%",
					type: MobileLibrary.DialogType.Message,
					title: "Do you want to proceed with below selection?",
					content: new List({
						items: {
							path: "SelItemModel>/",
							template: new StandardListItem({
								title: "{SelItemModel>key}",
								description: "{SelItemModel>text}"
							})
						}
					}),
					beginButton: new Button({
						type: MobileLibrary.ButtonType.Emphasized,
						text: "Yes",
						press: function () {
							this.getRecordsPQ();
							this.getRecordsEF();
							this.getRecordsPY();
							this.oConfirmDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oConfirmDialog.close();
						}.bind(this)
					})
				});
			}

			this.oConfirmDialog.open();
		},
		CheckMandatory: function (FilterItems) {
			var Message = "";
			if (this.getView().byId("IdItem1").getSelectedItems().length === 0) {
				this.getView().byId("IdItem1").setValueState("Error");
				Message += "Please select atleast one Item for Prod Qty Analytics\n";
			} else if (this.getView().byId("IdItem1").getSelectedItems().length > 4) {
				this.getView().byId("IdItem1").setValueState("Error");
				Message += "Please select only four Items for Prod Qty Analytics\n";
			} else {
				this.getView().byId("IdItem1").setValueState("None");
				this.getPrdQtyAnalytics(FilterItems);
			}
			if (this.getView().byId("IdItem2").getSelectedItems().length === 0) {
				this.getView().byId("IdItem2").setValueState("Error");
				Message += "Please select atleast one Item for Efficiency Analytics\n";
			} else if (this.getView().byId("IdItem2").getSelectedItems().length > 4) {
				this.getView().byId("IdItem2").setValueState("Error");
				Message += "Please select only four Items for Efficiency Analytics\n";
			} else {
				this.getView().byId("IdItem2").setValueState("None");
				this.getEffAnalytics(FilterItems);
			}
			if (this.getView().byId("IdItem3").getSelectedItems().length === 0) {
				this.getView().byId("IdItem3").setValueState("Error");
				Message += "Please select atleast one Item for Prod Yield Analytics\n";
			} else if (this.getView().byId("IdItem3").getSelectedItems().length > 4) {
				this.getView().byId("IdItem3").setValueState("Error");
				Message += "Please select only four Items for Prod Yield Analytics\n";
			} else {
				this.getView().byId("IdItem3").setValueState("None");
			}
			if (this.getView().byId("IdItem4").getSelectedItems().length === 0) {
				this.getView().byId("IdItem4").setValueState("Error");
				Message += "Please select atleast one Item for Reason\n";
			} else if (this.getView().byId("IdItem4").getSelectedItems().length > 4) {
				this.getView().byId("IdItem4").setValueState("Error");
				Message += "Please select only four Items for Reason\n";
			} else {
				this.getView().byId("IdItem4").setValueState("None");
			}
			if (this.getView().byId("IdItem5").getSelectedKey() === "") {
				this.getView().byId("IdItem5").setValueState("Error");
				Message += "Please select an Item for Rejection Analytics-1\n";
			} else {
				this.getView().byId("IdItem5").setValueState("None");
			}
			if (this.getView().byId("IdItem6").getSelectedKey() === "") {
				this.getView().byId("IdItem6").setValueState("Error");
				Message += "Please select an Item for Rejection Analytics-2\n";
			} else {
				this.getView().byId("IdItem6").setValueState("None");
			}
			if (Message) {
				sap.m.MessageBox.show(Message, sap.m.MessageBox.Icon.ERROR, "Error");
				return false;
			} else {
				return true;
			}

		},
		/*	1.This function is for creating filters based on the properties passed*/
		getFilters: function (PlantFilter, YearFilter, TimeFilter) {
			var oSelectedPlants = this.getView().byId("combobox1").getSelectedKeys();
			//Plant Filter
			var Plantfilters = [];
			for (var i = 0; i < oSelectedPlants.length; i++) {
				var aFilter = new sap.ui.model.Filter(PlantFilter, sap.ui.model.FilterOperator.EQ, oSelectedPlants[i]);
				Plantfilters.push(aFilter);
			}
			var PlantFilters = new sap.ui.model.Filter({
				filters: Plantfilters,
				and: false
			});
			//Year Filter
			var YearFilters = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter(YearFilter, sap.ui.model.FilterOperator.GT, this.getView().byId("DP1").getValue()),
					new sap.ui.model.Filter(YearFilter, sap.ui.model.FilterOperator.LT, this.getView().byId("DP2").getValue())
				],
				and: false
			});
			//Time Period Filter
			var Useropt = new sap.ui.model.Filter({
				path: TimeFilter,
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.getView().byId("combo2").getSelectedKey()
			});

			return [PlantFilters, YearFilters, Useropt];

		},
		/*	1.This function will get the filters from the above function and calls the backend to get the data for Card1*/
		getRecordsPQ: function () {
			var that = this;
			var ProdQtyFilters = this.getFilters("Plant", "PqYear", "Useropt");
			var oSelected = this.getView().byId("IdItem1").getSelectedItems();
			var Card1filters = [];
			for (var j = 0; j < oSelected.length; j++) {
				var bFilter = new sap.ui.model.Filter("Materialgr", sap.ui.model.FilterOperator.EQ, oSelected[j].getKey());
				Card1filters.push(bFilter);
			}
			var Card1Filter = new sap.ui.model.Filter({
				filters: Card1filters,
				and: false
			});
			ProdQtyFilters.push(Card1Filter);
			this.getOwnerComponent().getModel().read("/PQCardSet", {
				filters: ProdQtyFilters,
				success: function (data) {
					if (data.results.length > 0) {
						that.implementPQChart(data.results);
					}
				},
				error: function (response) {}
			});

		},
		/*	1.This function will get the filters from the above function and calls the backend to get the data for Card2*/
		getRecordsEF: function () {
			var that = this;
			var EAFilters = this.getFilters("Plant", "EfYear", "Useropt");
			var oSelected2 = this.getView().byId("IdItem2").getSelectedItems();
			var Card2filters = [];
			for (var k = 0; k < oSelected2.length; k++) {
				var aFilter3 = new sap.ui.model.Filter("WorkCenter", sap.ui.model.FilterOperator.EQ, oSelected2[k].getKey());
				Card2filters.push(aFilter3);
			}
			var Card2Filter = new sap.ui.model.Filter({
				filters: Card2filters,
				and: false
			});
			EAFilters.push(Card2Filter);
			this.getOwnerComponent().getModel().read("/EFCardSet", {
				filters: EAFilters,
				success: function (data) {
					if (data.results.length > 0) {
						that.implementEFChart(data.results);
					}
				},
				error: function (response) {}
			});
		},
		/*	1.This function will get the filters from the above function and calls the backend to get the data for Card3*/
		getRecordsPY: function () {
			var that = this;
			var PYFilters = this.getFilters("Plant", "PyYear", "Useropt"),
				oSelected2, sURL, TimeFilter;
			if (this.getView().byId("IdItem4").getVisible() === true) {
				oSelected2 = this.getView().byId("IdItem4").getSelectedItems();
				var Card3filters = [];
				for (var k = 0; k < oSelected2.length; k++) {
					var aFilter3 = new sap.ui.model.Filter("MaterialNo", sap.ui.model.FilterOperator.EQ, oSelected2[k].getKey());
					Card3filters.push(aFilter3);
				}
				var Card3Filter = new sap.ui.model.Filter({
					filters: Card3filters,
					and: false
				});
				PYFilters.push(Card3Filter);
				sURL = "/PYCardSet";
			} else {
				var Card3filters2 = [];
				oSelected2 = this.getView().byId("IdItem3").getSelectedItems();
				for (var l = 0; l < oSelected2.length; l++) {
					var aFilter3A = new sap.ui.model.Filter("MaterialGr", sap.ui.model.FilterOperator.EQ, oSelected2[l].getKey());
					Card3filters2.push(aFilter3A);
				}
				var Card3FilterA = new sap.ui.model.Filter({
					filters: Card3filters2,
					and: false
				});
				PYFilters.push(Card3FilterA);
				PYFilters.shift();
				var TimePeriod = this.getView().byId("combo2").getSelectedKey(),
					Month = this.getView().byId("IdItem5").getSelectedKey(),
					Quarter = this.getView().byId("IdItem6").getSelectedKey();
				if (TimePeriod === "QT") {
					TimeFilter = new sap.ui.model.Filter("PyQuarter", sap.ui.model.FilterOperator.EQ, Quarter);
					PYFilters.push(TimeFilter);
				}
				if (TimePeriod === "MT") {
					TimeFilter = new sap.ui.model.Filter("PyMonth", sap.ui.model.FilterOperator.EQ, Month);
					PYFilters.push(TimeFilter);
				}
				sURL = "/PYCardByMatGrpSet";
			}
			this.getOwnerComponent().getModel().read(sURL, {
				filters: PYFilters,
				success: function (data) {
					//	if (data.results.length > 0) {
					that.implementPYChart(data.results);
					//	}
				},
				error: function (response) {}
			});
		},
		/*	1.This function will implement the Graph in Card-1*/
		implementPQChart: function (ChartData) {
			var that = this;
			var oVizFrame = that.getView().byId("idVizFrameScore1"),
				oVizModel = new sap.ui.model.json.JSONModel(ChartData);
			that.getView().setModel(oVizModel, "PQChartModel");
			oVizFrame.destroyFeeds();
			oVizFrame.destroyDataset();
			oVizFrame.setModel(oVizModel);

			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Title",
					value: "{PQChartModel>Message}"
				}, {
					name: "Title 2",
					value: "{PQChartModel>MaterialgrDesc}"
				}],

				measures: [{
					name: ChartData[0].Year1,
					value: "{PQChartModel>QunYear1}"
				}, {
					name: ChartData[0].Year2,
					value: "{PQChartModel>QunYear2}"
				}, {
					name: ChartData[0].Year3,
					value: "{PQChartModel>QunYear3}"
				}],
				data: {
					path: "PQChartModel>/"
				}
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oVizModel);
			oVizFrame.setVizType("column");

			var feedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "valueAxis",
				"type": "Measure",
				"values": [ChartData[0].Year1]
			});
			var feedCategoryAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "categoryAxis",
				"type": "Dimension",
				"values": ["Title"]
			});
			var feedCategoryAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "categoryAxis",
				"type": "Dimension",
				"values": ["Title 2"]
			});
			var feedValueAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "valueAxis",
				"type": "Measure",
				"values": [ChartData[0].Year2]
			});
			var feedValueAxis3 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "valueAxis",
				"type": "Measure",
				"values": [ChartData[0].Year3]
			});
			this.setVizProperties(oVizFrame, "Prod Qty Analytics", "Production Quantity");
			oVizFrame.addFeed(feedValueAxis1);
			oVizFrame.addFeed(feedCategoryAxis1);
			oVizFrame.addFeed(feedCategoryAxis2);
			if (ChartData[0].Year2 !== "0000") {
				oVizFrame.addFeed(feedValueAxis2);
			}
			if (ChartData[0].Year3 !== "0000") {
				oVizFrame.addFeed(feedValueAxis3);
			}
		},
		/*	1.This function will implement the Graph in Card-2*/
		implementEFChart: function (ChartData) {
			var that = this;
			var oVizFrame = that.getView().byId("idVizFrameScore2"),
				oVizModel = new sap.ui.model.json.JSONModel(ChartData);
			that.getView().setModel(oVizModel, "EFChartModel");
			oVizFrame.destroyFeeds();
			oVizFrame.destroyDataset();
			oVizFrame.setModel(oVizModel);

			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Title",
					value: "{EFChartModel>Message}"
				}, {
					name: "Title 2",
					value: "{EFChartModel>WorkCenter}"
				}],

				measures: [{
					name: ChartData[0].EfYear1,
					value: "{EFChartModel>EfQanYear1}"
				}, {
					name: ChartData[0].EfYear2,
					value: "{EFChartModel>EfQanYear2}"
				}, {
					name: ChartData[0].EfYear3,
					value: "{EFChartModel>EfQanYear3}"
				}],
				data: {
					path: "EFChartModel>/"
				}
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oVizModel);
			oVizFrame.setVizType("column");

			var feedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "valueAxis",
				"type": "Measure",
				"values": [ChartData[0].EfYear1]
			});
			var feedCategoryAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "categoryAxis",
				"type": "Dimension",
				"values": ["Title"]
			});
			var feedCategoryAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "categoryAxis",
				"type": "Dimension",
				"values": ["Title 2"]
			});
			var feedValueAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "valueAxis",
				"type": "Measure",
				"values": [ChartData[0].EfYear2]
			});
			var feedValueAxis3 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "valueAxis",
				"type": "Measure",
				"values": [ChartData[0].EfYear3]
			});
			this.setVizProperties(oVizFrame, "Efficiency Analytics", "Line Efficiency");
			oVizFrame.addFeed(feedValueAxis1);
			oVizFrame.addFeed(feedCategoryAxis1);
			oVizFrame.addFeed(feedCategoryAxis2);
			if (ChartData[0].EfYear2 !== "0000") {
				oVizFrame.addFeed(feedValueAxis2);
			}
			if (ChartData[0].EfYear3 !== "0000") {
				oVizFrame.addFeed(feedValueAxis3);
			}
		},
		/*	1.This function will implement the Graph in Card-3*/
		implementPYChart: function (ChartData) {
			var that = this;
			var oVizFrame = that.getView().byId("idVizFrameScore3"),
				oVizModel = new sap.ui.model.json.JSONModel(ChartData);
			oVizModel.setSizeLimit(ChartData.length);
			that.getView().setModel(oVizModel, "PYChartModel");
			oVizFrame.destroyFeeds();
			oVizFrame.destroyDataset();
			oVizFrame.setModel(oVizModel);
			if (ChartData) {
				var oDataset = new sap.viz.ui5.data.FlattenedDataset({
					dimensions: [{
						name: "Time Period",
						value: "{PYChartModel>Message}"
					}, {
						name: "Material",
						value: "{PYChartModel>MaterialDetails}"
					}],
					measures: [{
						name: ChartData[0].Year1,
						value: "{PYChartModel>PyYear1}"
					}, {
						name: ChartData[0].Year2,
						value: "{PYChartModel>PyYear2}"
					}, {
						name: ChartData[0].Year3,
						value: "{PYChartModel>PyYear3}"
					}],
					data: {
						path: "PYChartModel>/"
					}
				});
				oVizFrame.setDataset(oDataset);
				oVizFrame.setModel(oVizModel);
				oVizFrame.setVizType("column");

				var feedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": [ChartData[0].Year1]
				});
				var feedCategoryAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Time Period"]
				});
				var feedCategoryAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Material"]
				});
				var feedValueAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": [ChartData[0].Year2]
				});
				var feedValueAxis3 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": [ChartData[0].Year3]
				});
				this.setVizProperties(oVizFrame, "Prod Yield Analytics", "Production Yield");
			

				oVizFrame.addFeed(feedValueAxis1);
				oVizFrame.addFeed(feedCategoryAxis1);
				oVizFrame.addFeed(feedCategoryAxis2);
				if (ChartData[0].Year2 !== "0000") {
					oVizFrame.addFeed(feedValueAxis2);
				}
				if (ChartData[0].Year3 !== "0000") {
					oVizFrame.addFeed(feedValueAxis3);
				}
			}
		},
		// Define the tooltip formatter function
		tooltipFormatter: function (oEvent) {
			var tooltipText = "";
			var data = oEvent.getParameter("data");
			var category = data.data.Category;
			var value = data.data.Value;

			tooltipText += "Category: " + category + "<br/>";
			tooltipText += "Value: " + value + "<br/>";

			return tooltipText;
		},

		setVizProperties: function (VizId, ChartTitle, YaxisLabel) {
			VizId.setVizProperties({
				plotArea: {
					dataPointSize: {
						min: 60,
						max: 90
					},
					isFixedDataPointSize: true,
					isScrollable: true,
					colorPalette: ["#3498DB", "#E67E22", "#27AE60"],
					dataLabel: {
						visible: true,
						showTotal: true
					}
				},
				valueAxis: {
					title: {
						visible: true,
						text: YaxisLabel
					},
					label: {
						style: {
							fontSize: "12px",
							fontWeight: "bolder"
						}
					}
				},
				categoryAxis: {
					title: {
						visible: false
					},
					label: {
						style: {
							fontSize: "12px",
							fontWeight: "bolder"
						}
					}
				},
				title: {
					text: ChartTitle
				},
				legendGroup: {
					layout: {
						position: "bottom"
					}
				},
				legend: {
					title: {
						visible: true,
						text: "Year Legend"
					}
				}

			});
		},

		/*	1.This function Invokes automatically when the user selects more than 4 Items in any combo box in the application*/
		onSelectChange: function (oEvent) {
			var Items = oEvent.getSource().getSelectedItems();
			if (Items.length > 4) {
				oEvent.getSource().setValueState("Error");
				oEvent.getSource().removeSelectedItem(Items[Items.length - 1]);
				oEvent.getSource().setValueStateText("Please Select 4 Items only");
			} else {
				oEvent.getSource().setValueState("None");
				oEvent.getSource().setValueStateText("");
			}
			this.getRecordsPY();
		},
		onSelectChange1: function (oEvent) {
			this.getRecordsPY();
		},
		/*This Function Triggers when the user selection is finished and the drop-down is closed*/
		onSelectFinish: function (oEvent) {
			oEvent.getSource().setValueState("None");
			oEvent.getSource().setValueStateText("");
			this.getGraphs(oEvent.getSource().getId());
		},
		getGraphs: function (Id) {
			if (Id.includes("Item1")) {
				this.getRecordsPQ();
			}
			if (Id.includes("Item2")) {
				this.getRecordsEF();
			}
			if (Id.includes("Item3") || Id.includes("Item4") || Id.includes("Item5") || Id.includes("Item6")) {
				this.getRecordsPY();
			}
			if (Id.includes("combo2")) {
				this.onSearchWithMatGrp();
			}
		},
		itemTableSelectionChange: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Beverages_product", {});
		},
		handleFromYearChange: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			this.getView().byId("DP2").setValue("");
			this.getView().byId("DP2").setMaxDate(new Date(Number(sValue) + 2, 0, 1));
			this.getView().byId("DP2").setMinDate(new Date(Number(sValue), 0, 1));
			if (sValue) {
				this.getView().byId("DP1").setValueState("None");
				this.getView().byId("DP1").setValueStateText("");
			}
		},
		handleChange: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			if (sValue) {
				oEvent.getSource().setValueState("None");
				oEvent.getSource().setValueStateText("");
			}
		},
		searchMatGrp: function (oEvent) {
			if (oEvent.getSource().getPressed()) {
				this.getView().byId("IdItem4").setVisible(false);
			} else {
				this.getView().byId("IdItem4").setVisible(true);
			}
		}
	});
});