/**
* Creates a new SubmitDocumentView. This view renders a dialog where the user can
* save the mind map.
* 
* @constructor
*/
mindmaps.SubmitDocumentView = function () {

    //Original
    var self = this;
    var $dialog = $("#template-save").tmpl().dialog({
        autoOpen: false,
        modal: true,
        zIndex: 5000,
        width: 550,
        close: function () {
            // remove dialog from DOM
            $(this).dialog("destroy");
            $(this).remove();
        }
    });


    var $saveCloudStorageButton = $("#button-save-cloudstorage").button().click(
            function () {
                if (self.cloudStorageButtonClicked) {
                    self.cloudStorageButtonClicked();
                }
            });

    var $localSorageButton = $("#button-save-localstorage").button().click(
            function () {
                if (self.localStorageButtonClicked) {
                    self.localStorageButtonClicked();
                }
            });

    var $autoSaveCheckbox = $("#checkbox-autosave-localstorage").click(
            function () {
                if (self.autoSaveCheckboxClicked) {
                    self.autoSaveCheckboxClicked($(this).prop("checked"));
                }
            });

    var $hddSaveButton = $("#button-save-hdd").button().downloadify({
        filename: function () {
            if (self.fileNameRequested) {
                return self.fileNameRequested();
            }
        },
        data: function () {
            //This is the part where the data is converted to json
            if (self.fileContentsRequested) {
                //data is self.fileContentsRequested();
                alert(self.fileContentsRequested());
                return self.fileContentsRequested();
            }
        },
        onComplete: function () {
            if (self.saveToHddComplete) {
                self.saveToHddComplete();
            }
        },
        onError: function () {
            console.log("error while saving to hdd");
        },
        swf: 'media/downloadify.swf',
        downloadImage: 'img/transparent.png',
        width: 65,
        height: 29,
        append: true
    });

    this.setAutoSaveCheckboxState = function (checked) {
        $autoSaveCheckbox.prop("checked", checked);
    }

    this.showSaveDialog = function () {
        $dialog.dialog("open");
    };

    this.hideSaveDialog = function () {
        $dialog.dialog("close");
    };

    this.showCloudError = function (msg) {
        $dialog.find('.cloud-error').text(msg);
    }

};

/**
* Creates a new SubmitDocumentPresenter. The presenter can store documents in the
* local storage or to a hard disk.
* 
* @constructor
* @param {mindmaps.EventBus} eventBus
* @param {mindmaps.MindMapModel} mindmapModel
* @param {mindmaps.SaveDocumentView} view
* @param {mindmaps.AutoSaveController} autosaveController
* @param {mindmaps.FilePicker} filePicker
*/
mindmaps.SubmitDocumentPresenter = function (eventBus, mindmapModel, view) {
    
    view.fileContentsRequested = function () {
        var doc = mindmapModel.getDocument();
        return doc.prepareSave().serialize();
    };

    this.go = function () {
        //Original
        //view.setAutoSaveCheckboxState(autosaveController.isEnabled());
        //view.showSaveDialog();

        //Modified by Eric
        if (view.fileContentsRequested) {
            SubmitMindMap(view.fileContentsRequested(),"FALSE");
        }
        else {
            alert("There is an error getting the data to submit. Please try again.");
        }
    };
};
