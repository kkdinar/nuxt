<template>
  <div class="card">
    <h1>Авторизация</h1>
    <div class="p-field p-grid">
        <label for="name" class="p-d-block">Логин</label>
        <div class="p-d-block">
          <InputText id="name" type="text" v-model="formData.Login"/>
        </div>
    </div>
    <div class="p-field p-grid">
        <label for="description" class="p-d-block">Пароль</label>
        <div class="p-d-block">      
          <Password v-model="formData.Password" :feedback="false" toggleMask></Password>    
          <!--<InputText id="name" type="text" v-model="formData.Password"/>-->
        </div>
    </div>
    <Button label="Войти" @click="enterForm"/>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formData: {},
    };
  },
  methods: {
    async enterForm() {
      const formData = {
        module: "session",
        data: {
          Login: this.$data.formData.Login,
          Password: this.$data.formData.Password,
        },
      };
      const answer = await this.$axios.$post("api", formData);
      if (answer.Error) alert(answer.Error);
      if (answer.Token) {
        localStorage.removeItem("UserAuthID");
        localStorage.setItem("UserAuthID", answer.Token);
        this.$router.push("/modules/");
        //window.location.reload();
      }
    },
  },
};
</script>


