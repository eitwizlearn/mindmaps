/**
 * Creates a new Application Controller.
 * 
 * @constructor
 */
mindmaps.ApplicationController = function () {
    var eventBus = new mindmaps.EventBus();
    var shortcutController = new mindmaps.ShortcutController();
    var commandRegistry = new mindmaps.CommandRegistry(shortcutController);
    var undoController = new mindmaps.UndoController(eventBus, commandRegistry);
    var mindmapModel = new mindmaps.MindMapModel(eventBus, commandRegistry, undoController);
    var clipboardController = new mindmaps.ClipboardController(eventBus,
      commandRegistry, mindmapModel);
    var helpController = new mindmaps.HelpController(eventBus, commandRegistry);
    var printController = new mindmaps.PrintController(eventBus,
      commandRegistry, mindmapModel);
    var autosaveController = new mindmaps.AutoSaveController(eventBus, mindmapModel);
    var filePicker = new mindmaps.FilePicker(eventBus, mindmapModel);

    /**
    * Handles the new document command.
    */
    function doNewDocument() {
        // close old document first
        var doc = mindmapModel.getDocument();
        doCloseDocument();

        var presenter = new mindmaps.NewDocumentPresenter(eventBus,
        mindmapModel, new mindmaps.NewDocumentView());
        presenter.go();
    }

    /**
    * Handles the save document command.
    */
    function doSaveDocument() {
        var presenter = new mindmaps.SaveDocumentPresenter(eventBus,
        mindmapModel, new mindmaps.SaveDocumentView(), autosaveController, filePicker);
        presenter.go();
    }

    /*------------------------------------------------------------------------------------------------------------------------
    BEGIN Eric created commands
    ------------------------------------------------------------------------------------------------------------------------*/
    function doRefreshDocument() {
        var presenter = new mindmaps.RefreshDocumentPresenter(eventBus,
        mindmapModel, new mindmaps.RefreshDocumentView(), autosaveController, filePicker);
        presenter.go();
    }

    function doSaveReleaseDocument() {
        var presenter = new mindmaps.SaveReleaseDocumentPresenter(eventBus,
        mindmapModel, new mindmaps.SaveReleaseDocumentView(), autosaveController, filePicker);
        presenter.go();
    }

    function doSubmitDocument() {
        var presenter = new mindmaps.SubmitDocumentPresenter(eventBus,
        mindmapModel, new mindmaps.SubmitDocumentView());
        presenter.go();
    }

    function doSubmitReleaseDocument() {
        var presenter = new mindmaps.SubmitReleaseDocumentPresenter(eventBus,
        mindmapModel, new mindmaps.SubmitReleaseDocumentView());
        presenter.go();
    }
    /*------------------------------------------------------------------------------------------------------------------------
    ENDEric created commands
    ------------------------------------------------------------------------------------------------------------------------*/

    /**
    * Handles the close document command.
    */
    function doCloseDocument() {
        var doc = mindmapModel.getDocument();
        if (doc) {
            // TODO for now simply publish events, should be intercepted by
            // someone
            mindmapModel.setDocument(null);
        }
    }

    /**
    * Handles the open document command.
    */
    function doOpenDocument() {
        var presenter = new mindmaps.OpenDocumentPresenter(eventBus,
        mindmapModel, new mindmaps.OpenDocumentView(), filePicker);
        presenter.go();
    }

    function doExportDocument() {
        var presenter = new mindmaps.ExportMapPresenter(eventBus,
        mindmapModel, new mindmaps.ExportMapView());
        presenter.go();
    }

    function doExportSaveDocument() {
        var presenter = new mindmaps.ExportSaveMapPresenter(eventBus,
        mindmapModel, new mindmaps.ExportSaveMapView());
        presenter.go();
    }

    /**
    * Initializes the controller, registers for all commands and subscribes to
    * event bus.
    */
    this.init = function () {
        var newDocumentCommand = commandRegistry
        .get(mindmaps.NewDocumentCommand);
        newDocumentCommand.setHandler(doNewDocument);
        newDocumentCommand.setEnabled(true);

        var openDocumentCommand = commandRegistry
        .get(mindmaps.OpenDocumentCommand);
        openDocumentCommand.setHandler(doOpenDocument);
        openDocumentCommand.setEnabled(true);

        var saveDocumentCommand = commandRegistry
        .get(mindmaps.SaveDocumentCommand);
        saveDocumentCommand.setHandler(doSaveDocument);

        /*------------------------------------------------------------------------------------------------------------------------
        BEGIN Eric created commands
        ------------------------------------------------------------------------------------------------------------------------*/
        var refreshDocumentCommand = commandRegistry
        .get(mindmaps.RefreshDocumentCommand);
        refreshDocumentCommand.setHandler(doRefreshDocument);

        var saveReleaseDocumentCommand = commandRegistry
        .get(mindmaps.SaveReleaseDocumentCommand);
        saveReleaseDocumentCommand.setHandler(doSaveReleaseDocument);

        var submitDocumentCommand = commandRegistry
        .get(mindmaps.SubmitDocumentCommand);
        submitDocumentCommand.setHandler(doSubmitDocument);

        var submitReleaseDocumentCommand = commandRegistry
        .get(mindmaps.SubmitReleaseDocumentCommand);
        submitReleaseDocumentCommand.setHandler(doSubmitReleaseDocument);

        var exportSaveCommand = commandRegistry.get(mindmaps.ExportSaveCommand);
        exportSaveCommand.setHandler(doExportSaveDocument);
        /*------------------------------------------------------------------------------------------------------------------------
        END Eric created commands
        ------------------------------------------------------------------------------------------------------------------------*/

        var closeDocumentCommand = commandRegistry
        .get(mindmaps.CloseDocumentCommand);
        closeDocumentCommand.setHandler(doCloseDocument);

        var exportCommand = commandRegistry.get(mindmaps.ExportCommand);
        exportCommand.setHandler(doExportDocument);

        eventBus.subscribe(mindmaps.Event.DOCUMENT_CLOSED, function () {
            refreshDocumentCommand.setEnabled(false);
            saveDocumentCommand.setEnabled(false);
            saveReleaseDocumentCommand.setEnabled(false);
            submitDocumentCommand.setEnabled(false);
            submitReleaseDocumentCommand.setEnabled(false);
            closeDocumentCommand.setEnabled(false);
            exportCommand.setEnabled(false);
            exportSaveCommand.setEnabled(false);
        });

        eventBus.subscribe(mindmaps.Event.DOCUMENT_OPENED, function () {
            refreshDocumentCommand.setEnabled(true);
            saveDocumentCommand.setEnabled(true);
            saveReleaseDocumentCommand.setEnabled(true);
            submitDocumentCommand.setEnabled(true);
            submitReleaseDocumentCommand.setEnabled(true);
            closeDocumentCommand.setEnabled(true);
            exportCommand.setEnabled(true);
            exportSaveCommand.setEnabled(true);
        });
    };

    /**
    * Launches the main view controller.
    */
    this.go = function () {
        var viewController = new mindmaps.MainViewController(eventBus,
        mindmapModel, commandRegistry);
        viewController.go();

        doNewDocument();
    };

    this.init();
};
