<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class App extends Vue {
  mpType = "app";
  onLaunch() {
    let frePlace = uni.getStorageSync("frePlace");
    if (frePlace == "") {
      let obj = {
        freHome: {},
        freCompany: {},
        freSchool: {},
        freOther: [],
      };
      uni.setStorageSync("frePlace", JSON.stringify(obj));
    }
  }
}
</script>

<style>
/*每个页面公共css */
</style>