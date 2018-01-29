<template>
	<gmap-info-window v-if="!!r" :options="infoWindowOptions" :position="r.position" @closeclick="$bus.$emit('toggleDotInfo')">
		<div class="rp-iwin">
			<template v-if="!editing">
				<h3 v-if="!!r.name">{{r.name}}</h3>
				<p v-html="compiledText"></p>
			</template>
			<div class="rp-iwin-note-editor" v-if="editing">
				<div class="form-group">
					<input type="text" class="form-control" v-model="name" placeholder="Marker name" />
				</div>
				<div class="form-group">
					<textarea class="form-control" v-model="text" rows="5" ref="text" placeholder="Marker description"></textarea>
				</div>
			</div>
			<p class="rp-iwin-param" v-if="r.position">
				<span class="rp-iwin-param-field">Location: </span>
				<span class="rp-iwin-param-value">{{r.position|latlng}}</span>
			</p>
			<p class="rp-iwin-param" v-if="r.position">
				<span class="rp-iwin-param-field">What is here: </span>
				<span class="rp-iwin-param-value">
					<span v-if="r.geocode.loading">Loading...</span>
					<span v-else-if="r.geocode.status==2">No result</span>
					<span v-else-if="r.geocode.status==1">{{r.geocode.data}}</span>
					<span v-else>Geocode data should be here.</span>
				</span>
			</p>
			<p class="rp-iwin-actions" v-if="!editing">
				<a class="rp-iwin-action btn btn-primary btn-sm" href="javascript:void(0)" @click="edit()"><span class="icon-pencil"></span> Edit</a>
				<a class="rp-iwin-action btn btn-default btn-sm" href="javascript:void(0)" @click="remove()"><span class="icon-times"></span> Delete</a>
			</p>
			<p class="rp-iwin-actions" v-if="editing">
				<a class="rp-iwin-action btn btn-primary btn-sm" href="javascript:void(0)" @click="save()"><span class="icon-checkmark"></span> Save</a>
				<a class="rp-iwin-action btn btn-default btn-sm" href="javascript:void(0)" @click="cancel()"><span class="icon-times"></span> Cancel</a>
				<a class="rp-iwin-action btn btn-success btn-sm" href="javascript:void(0)" @click="cancel()"><span class="icon-times"></span> Стиль</a>
				<!--<a class="rp-iwin-action" href="https://en.wikipedia.org/wiki/Markdown" target="_blank">Markdown supported</a>-->
				<div class="popup_window" v-if="editing">
					<form id="addIcons">
						<input type="hidden" value="upload_file" name="action">
						<label class="file_upload">
							<span class="button">Выбрать</span>
							<mark>Файл не выбран</mark>
							<input name="file_name" type="file">
						</label>
						<button class="btn btn-success" type="button" @click="uploadIcon()">Добавить</button>
					</form>
				</div>
			</p>
		</div>
	</gmap-info-window>
</template>

<script>
import Marked from "marked";

export default {
	data: function() {
		return {
			r: undefined,
			editing: false,
			name: "",
			text: ""
		}
	},
	computed: {
		infoWindowOptions: function() {
			return {
				pixelOffset: {
					width: 0,
					height: -40
				}
			}
		}
	},
	methods: {
		edit: function() {
			this.name = this.r.name;
			this.text = this.r.text;
			
			this.$nextTick(() => {
				this.editing = true;

                $(function(){
                    var wrapper = $( ".file_upload" ),
                        inp = wrapper.find( "input" ),
                        btn = wrapper.find( ".button" ),
                        lbl = wrapper.find( "mark" );

                    // Crutches for the :focus style:
                    inp.focus(function(){
                        wrapper.addClass( "focus" );
                    }).blur(function(){
                        wrapper.removeClass( "focus" );
                    });


                    var file_api = ( window.File && window.FileReader && window.FileList && window.Blob ) ? true : false;

                    inp.change(function(){
                        var file_name = "";
                        if( file_api && inp[ 0 ].files[ 0 ] )
                            file_name = inp[ 0 ].files[ 0 ].name;
                        /*else
                            file_name = inp.val().replace( "C:\\fakepath\\", '' );*/

                        if( ! file_name.length )
                            return;

                        if( lbl.is( ":visible" ) ){
                            lbl.text( file_name );
                            btn.text( "Выбрать" );
                        }else
                            btn.text( file_name );
                    }).change();

                });
                $( window ).resize(function(){
                    $( ".file_upload input" ).triggerHandler( "change" );
                });

			});
		},
		uploadIcon: function () {

            var ajax_settings = {
                // Your server script to process the upload
                url  : "http://www.barhopping.richcode.ru/maps/api/query.php",
                method : 'POST',

                // Form data
                data : new FormData($("#addIcons")[0]),

                // Tell jQuery not to process data or worry about content-type
                // You must include these options!
                cache      : false,
                contentType: false,
                processData: false,

                // Custom XMLHttpRequest
                xhr : function() {
                    var myXhr = jQuery.ajaxSettings.xhr();

                    // For adding progress bar during file download use code below.
                    if (myXhr.upload) {
                        // For handling the progress of the upload
                        myXhr.upload.addEventListener('progress', function(e) {
                            if (e.lengthComputable) {
                                jQuery('progress').attr({
                                    value: e.loaded,
                                    max: e.total,
                                });

                            }
                        } , false);
                    }

                    return myXhr;
                },

                success: function(data) {
                    console.log(data);
                }
            };
			console.log($("#addIcons input[type='file']").val());
            $.ajax(ajax_settings);
        },
		cancel: function() {
			this.name = "";
			this.text = "";
			this.editing = false;
		},
		save: function() {
			this.$store.dispatch("project/setShapeData",{id:this.r.id,name:this.name,text:this.text}).then(result => {
				this.$bus.$emit("success",result.msg);
				this.$bus.$emit("toggleDotInfo");
				this.cancel();
			}).catch(result => this.$bus.$emit("error",result.msg));
		},
		remove: function() {
			this.$store.dispatch("project/removeShape",this.r).then(result => {
				this.$bus.$emit("success",result.msg);
				this.r = undefined;
			}).catch(result => this.$bus.$emit("error",result.msg));
		}
	},
	mounted: function() {
		this._toggle = (data,editing) => {
			if (!data || (this.r && this.r==data.r)) {
				this.r = undefined;
				this.cancel();
				return;
			}
			this.r = data;
			editing ? this.edit() : this.cancel();
		}
		this._show = (data,editing) => {
			if (data) {
				this.r = data;
				editing ? this.edit() : this.cancel();
			}
		}
		this.$bus.$on("toggleDotInfo",this._toggle);
		this.$bus.$on("showDotInfo",this._show);
	},
	beforeDestroy: function() {
		this._toggle && this.$bus.$off("toggleDotInfo",this._toggle);
		this._show && this.$bus.$off("showDotInfo",this._show);
	}
}

</script>
<style>
	#addIcons
	{
		width: 100%;
		text-align: center;
		margin-top: 10px;
		margin-left: 5px;
		margin-right: 5px;
	}
	#addIcons button
	{
		font-size: 1em;
	}
	.gm-style-iw
	{
		overflow: unset !important;
	}
	.popup_window
	{
		position: absolute;
		height: 254px;
		width: 300px;
		background: #e6e6e6;
		display: inline-flex;
		right: -150px;
		z-index: 2;
		border-radius: 3px;
		transform: translateY(-50%);
		box-shadow: 0 0 10px rgba(0,0,0,0.5);
	}
	.popup_window:before
	{
		position: absolute;
		top: 50%;
		left: -30px;
		border: 15px solid transparent;
		border-right-color: #e6e6e6;
		content: "";
		transform: translateY(-50%);
		margin-top: -23px;
	}
	.file_upload{
		display: block;
		position: relative;
		overflow: hidden;
		font-size: 1em;              /* example */
		height: 2em;                 /* example */
		line-height: 2em;             /* the same as height */
		width: 100%;
	}
	.file_upload .button, .file_upload > mark{
		display: block;
		cursor: pointer;              /* example */
		text-align: left;
		word-break: break-word;
	}
	.file_upload .button{
		float: right;
		box-sizing: border-box;
		-moz-box-sizing: border-box;
		width: 8em;                  /* example */
		height: 100%;
		text-align: center           /* example */
	}
	.file_upload > mark{
		background: transparent;     /* example */
		padding-left: 1em            /* example */
	}
	@media only screen and ( max-width: 500px ){  /* example */
		.file_upload > mark{
			display: none
		}
		.file_upload .button{
			width: 100%
		}
	}
	.file_upload input[type=file]{
		position: absolute;
		top: 0;
		opacity: 0
	}

	/* Making it beautiful */

	.file_upload{
		border: 1px solid #ccc;
		border-radius: 3px;
		box-shadow: 0 0 5px rgba(0,0,0,0.1);
		transition: box-shadow 0.1s linear
	}
	.file_upload.focus{
		box-shadow: 0 0 5px rgba(0,30,255,0.4)
	}
	.file_upload .button{
		background: #7300df;
		transition: background 0.2s;
		border: 1px solid rgba(0,0,0,0.1);
		border-color: rgba(0,0,0,0.1) rgba(0,0,0,0.1) rgba(0,0,0,0.25);
		border-radius: 2px;
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2) inset, 0 1px 2px rgba(0, 0, 0, 0.05);
		color: #fff;
		text-shadow: #6200bd 0 -1px 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis
	}
	.file_upload:hover .button{
		background: #6200bd;
		text-shadow: #5d00b3 0 -1px 0
	}
	.file_upload:active .button{
		background: #5d00b3;
		box-shadow: 0 0 3px rgba(0,0,0,0.3) inset
	}

</style>