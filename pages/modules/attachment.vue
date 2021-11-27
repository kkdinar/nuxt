<template>
  <div class="container">
    <div>
      <Toolbar>
        <template #left>
          <Button label="Выйти" icon="pi pi-times" @click="clickExit()"/>
          <i class="pi pi-bars p-toolbar-separator p-mr-2" />
          <FileUpload mode="basic" name="demo[]" :customUpload="true" @uploader="myUploader" :maxFileSize="100000000" chooseLabel="Создать" :auto="true"/>
          <!--<Button label="Создать" icon="pi pi-plus" @click="clickNew()" class="p-button-success"/>-->
          <i class="pi pi-bars p-toolbar-separator p-mr-2" />
          <Button label="Удалить" icon="pi pi-trash" @click="clickDelete()" class="p-button-error"/>
          <i class="pi pi-bars p-toolbar-separator p-mr-2" />
          <Button label="Сохранить" icon="pi pi-check" @click="clickSave()" class="p-button-success"/>
        </template>
      </Toolbar>
      <transition-group name="p-messages" tag="div">
        <Message v-for="msg of messages" :life="3000" :sticky="false" :severity="msg.severity" :key="msg.content">{{msg.content}}</Message>
      </transition-group>
      <DataTable :value="FormData.Entity" :selection.sync="selectedRows" dataKey="id" editMode="cell" class="p-datatable-gridlines">
        <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
        <Column field="id" header="Код" headerStyle="width: 5em"></Column>
        <Column field="Name" header="Вложение">
          <template #body="slotProps">
            <Button :label="slotProps.data.Name" class="p-button-link" @click="Link(slotProps.data)"/>
          </template>
        </Column>
        <Column field="Description" header="Описание">
          <template #editor="slotProps">
            <InputText v-model="slotProps.data[slotProps.column.field]" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      FormData: {},
      messages: [],
      selectedRows: [],
      backURL: null,
      module: null,
      form: null,
      id: null,
    };
  },
  async mounted() {
    this.backURL = this.$route.query.backURL;
    this.module = this.$route.query.module;
    this.form = this.$route.query.form;
    this.id = this.$route.query.id;
    //console.log('module=',this.module,this.form,this.id);
    let config = {
      params: {
        module: this.module,
        form: this.form,
        id: this.id,
        UserAuthID: localStorage.getItem("UserAuthID"),
      },
    };
    let answer = await this.$axios.$get("api", config);
    if (answer.Error == "Token is expired") this.$router.push("/auth");
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];
    else {
      let Entity = [];
      for await (const row of answer.Entity) {
        config = {
          params: {
            module: "filestorage",
            form: "FileStorageReestr",
            id: row.FileStorage_id,
            UserAuthID: localStorage.getItem("UserAuthID"),
          },
        };
        answer = await this.$axios.$get("api", config);
        Entity.push(answer.DocMovement);
      }
      this.FormData = { Entity };
    }
  },
  methods: {
    async myUploader(event) {
      //console.log("event=", event.files);
      let formData = new FormData();
      formData.append("file", event.files[0]);
      //console.log(">> formData >> ", formData);

      // You should have a server side REST API
      let answer = await this.$axios.$post("upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          UserAuthID: localStorage.getItem("UserAuthID"),
        },
      });
      //console.log('answer=',answer);

      if (answer.Error)
        this.messages = [{ severity: "error", content: answer.Error }];
      else {
        const FileStorage_id = answer.DocMovement.id;
        const FileName = answer.DocMovement.Name;
        this.$data.messages = [
          { severity: "success", content: "Файл сохранён" },
        ];
        //Заполняем Entity у формы
        const _formData = {
          module: this.$data.module,
          form: this.$data.form,
          UserAuthID: localStorage.getItem("UserAuthID"),
          data: {
            Entity: [
              {
                Parent: this.$data.id,
                FileStorage_id: FileStorage_id,
              },
            ],
          },
        };
        //console.log("_formData=", _formData);
        answer = await this.$axios.$post("api", _formData);
        if (answer.Error)
          this.$data.messages = [{ severity: "error", content: answer.Error }];
        else {
          const data = { id: FileStorage_id, Name: FileName };
          this.$data.FormData.Entity.push(data);

          //console.log('answer=',answer);
          //Заполняем данные модуля filestorage
          const formDataFileStorage = {
            module: "filestorage",
            form: "FileStorage",
            UserAuthID: localStorage.getItem("UserAuthID"),
            data: {
              DocMovement: {
                id: FileStorage_id,
                ParentModuleName: this.$data.module,
                ParentFormName: answer.Entity.FormName,
                ParentForm_id: answer.Entity.id,
              },
            },
          };
          //console.log("formDataFileStorage=", formDataFileStorage);
          answer = await this.$axios.$post("api", formDataFileStorage);
          if (answer.Error)
            this.$data.messages = [
              { severity: "error", content: answer.Error },
            ];
          else window.location.reload();
        }
      }
    },
    async Link(data) {
      const config = {
        params: {
          module: "filestorage",
          form: "FileStorageReestr",
          id: data.id,
          UserAuthID: localStorage.getItem("UserAuthID"),
        },
        responseType: "blob",
      };
      const answer = await this.$axios.$get("download", config);
      if (answer.Error)
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      else {
        const blob = new Blob([answer], { type: "application/*" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = data.Name;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    },
    async clickExit() {
      this.$router.push(this.backURL);
    },
    async clickDelete() {
      /*
      for await (const row of this.$data.selectedRows) {
        const formData = {
          data: {
            module: "filestorage",
            form: "FileStorage",
            data: {
              DocMovement: { id: row.id },
            },
            UserAuthID: localStorage.getItem("UserAuthID"),
          },
        };
        const answer = await this.$axios.$delete("api", formData);
        if (answer.Error)
          this.$data.messages = [{ severity: "error", content: answer.Error }];
      }*/
      const formData = {
        data: {
          module: "filestorage",
          form: "FileStorage",
          data: {
            DocMovement: this.$data.selectedRows,
          },
          UserAuthID: localStorage.getItem("UserAuthID"),
        },
      };
      const answer = await this.$axios.$delete("api", formData);
      if (answer.Error)
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      else {
        const newTable = [];
        this.$data.FormData.Entity.forEach((row) => {
          if (!this.$data.selectedRows.some((r) => row.id == r.id))
            newTable.push(row);
        });
        this.$data.FormData.Entity = newTable;
        this.$data.selectedRows = [];
      }
    },
    async clickSave() {
      const rows = this.$data.FormData.Entity;
      for await (const row of rows) {
        const formData = {
          module: "filestorage",
          form: "FileStorage",
          data: {
            DocMovement: row,
          },
          UserAuthID: localStorage.getItem("UserAuthID"),
        };
        //console.log("formData=", formData.data);
        const answer = await this.$axios.$post("api", formData);
        if (answer.Error)
          this.$data.messages = [{ severity: "error", content: answer.Error }];
        else
          this.$data.messages = [
            { severity: "success", content: "Документ сохранён" },
          ];
      }
    },
  },
};
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
