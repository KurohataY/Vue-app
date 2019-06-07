/* global Vue */

var API_KEY = "FickerのAPI入力";

// 状態の定数
var IS_INITIALIZED = "IS_INITIALIZED"; // 最初の状態
var IS_FETCHING = "IS_FETCHING"; // APIからデータを取得中
var IS_FAILED = "IS_FAILED"; // APIからデータを取得できなかった
var IS_FOUND = "IS_FOUND"; // APIから写真データを取得できた

Vue.directive("tooltip", {
  bind: function(el, binding) {
    $(el).tooltip({
      title: binding.value,
      placement: "bottom"
    });
  },
  unbind: function(el) {
    $(el).tooltip("destroy");
  }
});

Vue.component('animal-photo', {
  name: 'animal-photo',
  props: ["photos"],
  template: `
        <div >
          <a
            v-for="photo in photos"
            v-bind:key="photo.id"
            v-bind:href="photo.pageURL"
            v-tooltip="photo.text"
            class="flickr-link"
            target="_blank"
          >
            <img
              v-bind:src="photo.imageURL"
              v-bind:alt="photo.text"
              width="150"
              height="150"
            />
          </a>
        </div>
  `
});

new Vue({
  el: "#gallery",
  data: {
    prevSearchText: "",
    photos: [],
    photos2: [],
    currentState: IS_INITIALIZED
  },
  created: function(){
    this.fetchImagesFromFlickr();
  },
  computed: {
    isInitalized: function() {
      return this.currentState === IS_INITIALIZED;
    },
    isFetching: function() {
      return this.currentState === IS_FETCHING;
    },
    isFailed: function() {
      return this.currentState === IS_FAILED;
    },
    isFound: function() {
      return this.currentState === IS_FOUND;
    }
  },
  methods: {
    // 状態を変更する
    toFetching: function() {
      this.currentState = IS_FETCHING;
    },
    toFailed: function() {
      this.currentState = IS_FAILED;
    },
    toFound: function() {
      this.currentState = IS_FOUND;
    },

    // photoオブジェクトから画像のURLを作成して返す
    getFlickrImageURL: function(photo, size) {
      var url =
        "https://farm" +
        photo.farm +
        ".staticflickr.com/" +
        photo.server +
        "/" +
        photo.id +
        "_" +
        photo.secret;
      if (size) {
        // サイズ指定ありの場合
        url += "_" + size;
      }
      url += ".jpg";
      return url;
    },
    // photoオブジェクトからページのURLを作成して返す
    getFlickrPageURL: function(photo) {
      return "https://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
    },
    // photoオブジェクトからaltテキストを生成して返す
    getFlickrText: function(photo) {
      var text = "\"" + photo.title + "\" by " + photo.ownername;
      if (photo.license == "4") {
        // Creative Commons Attribution（CC BY）ライセンス
        text += " / CC BY";
      }
      return text;
    },
    
    fetchImagesFromFlickr: function(event) {
      console.log("aaa");
      var vm = this;
      var parameters1 = $.param({
        method: "flickr.photos.search",
        api_key: API_KEY,
        text: 'cat', // 検索テキスト
        sort: "interestingness-desc", // 興味深さ順
        per_page: 4, // 取得件数
        license: "4", // Creative Commons Attributionのみ
        extras: "owner_name,license", // 追加で取得する情報
        format: "json", // レスポンスをJSON形式に
        nojsoncallback: 1 // レスポンスの先頭に関数呼び出しを含めない
      });
      var flickr_url1 = "https://api.flickr.com/services/rest/?" + parameters1;

      var parameters2 = $.param({
        method: "flickr.photos.search",
        api_key: API_KEY,
        text: 'dog', // 検索テキスト
        sort: "interestingness-desc", // 興味深さ順
        per_page: 4, // 取得件数
        license: "4", // Creative Commons Attributionのみ
        extras: "owner_name,license", // 追加で取得する情報
        format: "json", // レスポンスをJSON形式に
        nojsoncallback: 1 // レスポンスの先頭に関数呼び出しを含めない
      });
      var flickr_url2 = "https://api.flickr.com/services/rest/?" + parameters2;
      
      // APIからデータを取得中で、なおかつ検索テキストが前回の検索時と同じ場合、再度リクエストしない

      this.toFetching();
      $.getJSON(flickr_url1, function(data) {
        if (data.stat !== "ok") {
          vm.toFailed();
          return;
        }

        var _photos1 = data.photos.photo;

        vm.photos = _photos1.map(function(photo) {
          return {
            id: photo.id,
            imageURL: vm.getFlickrImageURL(photo, "q"),
            pageURL: vm.getFlickrPageURL(photo),
            text: vm.getFlickrText(photo)
          };
        });
        vm.toFound();
      }).fail(function() {
        vm.toFailed();
      });
      
      $.getJSON(flickr_url2, function(data) {
        if (data.stat !== "ok") {
          vm.toFailed();
          return;
        }

        var _photos2 = data.photos.photo;

        vm.photos2 = _photos2.map(function(photo) {
          return {
            id: photo.id,
            imageURL: vm.getFlickrImageURL(photo, "q"),
            pageURL: vm.getFlickrPageURL(photo),
            text: vm.getFlickrText(photo)
          };
        });
        vm.toFound();
      }).fail(function() {
        vm.toFailed();
      });
    }
  }
});