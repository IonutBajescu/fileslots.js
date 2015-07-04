window.slotProgressBars = 0;
window.fileId = 0;

class FilesSlots extends React.Component {

    constructor(props) {
        super(props);

        var files = typeof props.files === 'undefined' ? [] : JSON.parse(props.files);
        this.state = {
            files: files
        };

        this.slot_size = '95px';

        this.state.form = $('<form action="' + this.props.target + '" method="post" enctype="multipart/form-data" style="display:none"/>').appendTo('body');
        this.attachUploader(this.props.name, this.state.form);
    }

    attachUploader(name, form) {

        var selector = '[data-name="' + name + '"]';

        var progress = function (id) {
            return $('[data-progress="' + id + '"]');
        };

        var id = 0;

        var slots = this;
        $(form).ajaxForm({
            beforeSend: function () {
                id = ++window.slotProgressBars;
                $(selector).parent().after('<div data-progress="' + id + '" class="ui progress" style="display:none"><div class="bar"><div class="progress"></div></div></div>');
                progress(id).fadeIn(200).addClass('active');
            },
            uploadProgress: function (event, position, total, percentComplete) {
                progress(id).progress({
                    percent: percentComplete
                });
            },
            complete: function (xhr) {
                progress(id).addClass('success').removeClass('active');
                setTimeout(function () {
                    $('[data-progress]').fadeOut(200);
                }, 500);

                xhr.responseJSON.files.forEach(((uploaded_file, i) => {
                    slots.state.files.forEach(((file, j) => {
                        if (!file.uploaded && file.name == uploaded_file.real_filename) {
                            slots.state.files[j].uploaded = true;
                            slots.state.files[j].id = uploaded_file.id;
                            slots.state.files[j].url = uploaded_file.url;
                            slots.state.files[j].preview = uploaded_file.preview;
                            slots.state.files[j].download = uploaded_file.download;
                        }
                    }));
                }));
                slots.setState({files: slots.state.files});
            }
        });
    }

    renderFullSlot(file) {
        return (
            <div
                onMouseLeave={this.slotSizeAnimation.bind(this, file, 'leave')}
                onMouseEnter={this.slotSizeAnimation.bind(this, file, 'enter')}
            >
                <div
                    className="slot-container ui move up reveal"
                    style={{float: 'left', width: this.slot_size}}
                    data-index={file.index}
                >
                    <div className="visible content">
                        <div
                            className="full slot"
                            style={{backgroundImage: 'url(' + file.preview + ')'}}
                        >
                            <div className="name"> {file.name} </div>
                        </div>
                    </div>
                    <div className="hidden content">
                        <div className="slot-options">
                            <div className="title">
                                Options for {file.name}
                            </div>
                            <br/>

                            <div>
                                <a className="ui fluid green button" target="_blank" href={file.download}>
                                    <i className="download icon"></i>
                                    Download
                                </a>
                                <div className="ui fluid yellow button">
                                    <i className="edit icon"></i>
                                    Rename
                                </div>
                                <div className="ui fluid red button" onClick={this.removeFile.bind(this, file)}>
                                    <i className="delete icon"></i>
                                    Remove
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    removeFile(remove) {
        this.state.files.forEach(((file, index) => {
            if (file.index == remove.index) {
                this.state.files.splice(index, 1);
            }
        }));

        this.setState({
            files: this.state.files
        });
    }

    slotSizeAnimation(file, animation) {
        var container = $('.slot-container[data-index="' + file.index + '"]');
        var slot = container.find('.slot, .slot-options');

        var options = {
            duration: 200,
            queue: false
        };

        var leave = (element) => element.animate({
            width: this.slot_size,
            height: this.slot_size
        }, options);

        var enter = (element) => element.animate({
            width: '200px',
            height: '180px'
        }, options);


        if (animation == 'enter') {
            enter(container);
            enter(slot);
        }
        else {
            leave(container);
            leave(slot);
        }
    }

    renderEmptySlot() {
        return (
            <div>
                <div className="empty slot" onClick={this.displayFileChooser.bind(this)}>
                    <i className="upload icon"></i>
                </div>
            </div>
        );
    }

    handleSlotFilling(event) {
        var files = event.target.files;
        if (files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = {
                    name: files[i].name.split(/(\\|\/)/g).pop(),
                    uploaded: false
                };

                if (file.name.match(/\.pdf$/i)) {
                    file.preview = '/assets/pdf.png';
                }

                var index = this.state.files.push(file) - 1;
                this.state.files[index].index = window.fileId++;
                this.handleImageAvailable(files[i], index);
            }


            this.setState({
                files: this.state.files
            });

            this.state.form.submit();
        }
    }

    handleImageAvailable(file, index) {
        var reader = new FileReader(), slots = this;
        reader.readAsDataURL(file);
        reader.onload = function (e) {
            for (var i = 0; i < slots.state.files.length; i++) {
                if (i === index) {
                    if (slots.state.files[i].name.match(/\.(jpg|png|gif|jpeg)$/i)) {
                        slots.state.files[i].preview = e.target.result;
                    }
                    slots.state.files[i].url = e.target.result;
                }
            }
            slots.setState({files: slots.state.files});
        };
    }

    displayFileChooser(e) {
        var input = this.createNewInput();
        React.render(input, this.state.form[0]);
        this.state.form.find('[type=file]').last().trigger(e);
    }

    createNewInput() {
        return (
            <input type="file" name="files[]" onChange={this.handleSlotFilling.bind(this)} multiple/>
        );
    }

    render() {
        var getFilesIds = _.map(this.state.files, (file) => file.id);

        return (
            <div className="files-slots-widget" data-name={this.props.name}>
                <div className="files-slots">
                    {this.state.files.map(this.renderFullSlot.bind(this))}
                    {_.range(0, this.props.empty_slots).map(this.renderEmptySlot.bind(this))}
                </div>

                <input type="hidden" name={this.props.name} value={getFilesIds.join(',')}/>

                <div className="clearfix"></div>
            </div>
        );
    }
}

window.FilesSlots = FilesSlots;
