<template>
  <div>
    <Toolbar>
      <template #left>
        <Button label="Выйти" icon="pi pi-times" @click="clickExit()"/>
        <i class="pi pi-bars p-toolbar-separator p-mr-2" />
        <Button label="Сохранить" icon="pi pi-check" @click="clickSave()" class="p-button-success"/>
      </template>
    </Toolbar>
    <transition-group name="p-messages" tag="div">
      <Message v-for="msg of messages" :life="3000" :sticky="false" :severity="msg.severity" :key="msg.content">{{msg.content}}</Message>
    </transition-group>
    <div class="p-fluid">    
      <div class="p-field p-grid">
          <label for="name" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Наименование</label>
          <div class="p-col-12 p-md-10">
            <InputText id="name" type="text" v-model="FormData.DocMovement.Name"/>
          </div>
      </div>
      <div class="p-field p-grid">
          <label for="description" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Описание</label>
          <div class="p-col-12 p-md-10">          
            <Textarea id="description" v-model="FormData.DocMovement.Description" :autoResize="true" rows="5" cols="30" />
          </div>
      </div> 
      <div class="p-field p-grid">
          <label for="user" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Сотрудник</label>
          <AutoComplete id="user" v-model="selectedUser" :suggestions="filteredUser" @complete="searchUser($event)" :dropdown="true" field="Name" forceSelection>
            <template #item="slotProps">
              <div>{{slotProps.item.Name}}</div>
            </template>
          </AutoComplete>
      </div>
      <div>
        <label>----------</label>
      </div>
      <!--<div class="p-field p-grid">
          <label for="module" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Модуль</label>
          <div class="p-col-12 p-md-10">
            <Dropdown id="module" v-model="selectedModule" :options="modulesArr" optionLabel="Name" :filter="true" placeholder="Выберите модуль" :showClear="true">
              <template #value="slotProps">
                <div class="country-item country-item-value" v-if="slotProps.Name"> 
                  <div>{{slotProps.value.Name}}</div>
                </div>
                <span v-else>
                  {{slotProps.placeholder}}
                </span>
              </template>
              <template #option="slotProps">
                <div class="country-item">
                  <div>{{slotProps.option.Name}}</div>
                </div>
              </template>
            </Dropdown>
          </div>
      </div>
      <div class="p-field p-grid">
          <label for="form" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Форма</label>
          <div class="p-col-12 p-md-10">
            <Dropdown id="form" v-model="selectedModule" :options="modulesArr" optionLabel="Name" :filter="true" placeholder="Выберите форму" :showClear="true">
              <template #value="slotProps">
                <div class="country-item country-item-value" v-if="slotProps.Name"> 
                  <div>{{slotProps.value.Name}}</div>
                </div>
                <span v-else>
                  {{slotProps.placeholder}}
                </span>
              </template>
              <template #option="slotProps">
                <div class="country-item">
                  <div>{{slotProps.option.Name}}</div>
                </div>
              </template>
            </Dropdown>
          </div>
      </div>-->
      
      <div>
        <label>----------</label>
      </div>
      <Toolbar class="p-mb-4">
        <template #left>
          <Button label="Создать" icon="pi pi-plus" class="p-button-success p-mr-2" @click="openNew" />
          <Button label="Удалить" icon="pi pi-trash" class="p-button-danger" @click="deleteSelectedRow" :disabled="!selectedRows || !selectedRows.length" />
        </template>
      </Toolbar>
      <DataTable :value="FormData.Entity" :selection.sync="selectedRows" dataKey="id" editMode="row" class="p-datatable-gridlines" :editingRows.sync="editingRows"
        @row-edit-init="onRowEditInit" @row-edit-cancel="onRowEditCancel">
        <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
        <Column :rowEditor="true" headerStyle="width:7rem" bodyStyle="text-align:center" header="Править"></Column>
        <Column field="id" header="Код" headerStyle="width: 5em"></Column>        
        <Column field="ModuleName" header="Модуль">
          <template #editor="slotProps">
            <Dropdown v-model="slotProps.data['ModuleName']"  @input="onCellEditModuleName($event, slotProps)" :options="modulesArr" optionLabel="Name" optionValue="module" placeholder="Выберите модуль" autofocus >
              <template #option="slotProps">
                <span :class="'product-badge status-' + slotProps.option.Name.toLowerCase()">{{slotProps.option.Name}}</span>
              </template>
            </Dropdown>
          </template>
          <template #body="slotProps">
            {{getModuleName(slotProps.data.ModuleName)}}
          </template>
        </Column>
        <Column field="Form_Name" header="Форма">
          <template #editor="slotProps">
            <Dropdown v-model="slotProps.data['Form_Name']" @input="onCellEdit($event, slotProps)" :options="formsArr" optionLabel="Name" optionValue="form" placeholder="Выберите форму">
              <template #option="slotProps">
                <span :class="'product-badge status-' + slotProps.option.Name.toLowerCase()">{{slotProps.option.Name}}</span>
              </template>
            </Dropdown>
          </template>
          <template #body="slotProps">
            {{getFormName(slotProps.data.Form_Name,slotProps.data.ModuleName)}}
          </template>
        </Column>
        <Column field="Write" header="Право на изменение">
          <template #editor="slotProps">
            <Checkbox id="binary" v-model="slotProps.data[slotProps.column.field]" :binary="true" />
          </template>
          <template #body="slotProps">
            <Checkbox id="binary" v-model="slotProps.data[slotProps.column.field]" :binary="true" />
          </template>
        </Column>
        <Column field="Name" header="Наименование">
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
      FormData: {
        DocMovement: {},
        Entity: [],
      },
      messages: [],
      filteredUser: null,
      Users: [],
      selectedUser: null,
      selectedRows: null,
      modulesArr: [],
      selectedModule: null,
      formsArr: [],
      editingCellRows: {},
      modulesFormsArr: [],

      editingRows: [],
    };
  },
  originalRows: null,
  async mounted() {
    let config = {
      params: {
        module: "userdocright",
        form: "UserRight",
        id: this.$route.query.id,
        UserAuthID: localStorage.getItem("UserAuthID"),
      },
    };
    let answer = await this.$axios.$get("api", config);
    if (answer.Error == "Token is expired") this.$router.push("/auth");
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];
    else this.FormData = answer;

    if (answer.DocMovement.User_id)
      this.selectedUser = {
        id: answer.DocMovement.User_id,
        Name: answer.DocMovement.User_Name,
      };

    config = { params: { UserAuthID: localStorage.getItem("UserAuthID") } };
    answer = await this.$axios.$get("api", config);
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];
    else this.modulesArr = answer.Entity;

    //Собираем формы по всем модулям
    for await (const Module of this.modulesArr) {
      const config = {
        params: {
          module: Module.module,
          UserAuthID: localStorage.getItem("UserAuthID"),
        },
      };
      const answer = await this.$axios.$get("/api", config);
      this.modulesFormsArr.push({
        module: Module.module,
        formsArr: answer.Entity,
      });
    }

    config = {
      params: {
        module: "dictionary",
        form: "UserForm",
        UserAuthID: localStorage.getItem("UserAuthID"),
      },
    };
    answer = await this.$axios.$get("api", config);
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];
    else this.Users = answer.Entity;

    this.originalRows = {};
  },
  methods: {
    async searchUser(event) {
      if (!this.$data.Users[0]) {
        const config = {
          params: {
            module: "dictionary",
            form: "UserForm",
            UserAuthID: localStorage.getItem("UserAuthID"),
          },
        };
        const answer = await this.$axios.$get("api", config);
        if (answer.Error) {
          this.$data.messages = [{ severity: "error", content: answer.Error }];
          this.$data.Users = [];
        } else this.$data.Users = answer.Entity;
      }
      setTimeout(() => {
        if (!event.query.trim().length) {
          this.filteredUser = [...this.Users];
        } else {
          this.filteredUser = this.Users.filter((row) => {
            return row.Name.toLowerCase().startsWith(event.query.toLowerCase());
          });
        }
      }, 250);
    },
    async openNew() {
      const formData = {
        module: "userdocright",
        form: "UserRight",
        UserAuthID: localStorage.getItem("UserAuthID"),
        data: {
          DocMovement: {
            id: this.$data.FormData.DocMovement.id,
            Name: this.$data.FormData.DocMovement.Name,
            User_id: this.$data.FormData.DocMovement.selectedUser,
          },
          Entity: [
            {
              Parent: this.$data.FormData.DocMovement.id,
            },
          ],
        },
      };
      const answer = await this.$axios.$post("api", formData);
      if (answer.Error)
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      else this.$data.FormData.Entity.push(answer.Entity);
      //console.log("formData=", formData);
      //window.location.reload();
    },
    async deleteSelectedRow() {
      const formData = {
        data: {
          module: "userdocright",
          form: "UserRight",
          data: {
            Entity: this.$data.selectedRows,
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
    onRowEditInit(event) {
      this.originalRows[event.index] = { ...this.FormData.Entity[event.index] };
      const moduleName = this.originalRows[event.index].ModuleName;
      const Forms = this.$data.modulesFormsArr.find(
        (r) => r.module == moduleName
      );
      this.$data.formsArr = (Forms || {}).formsArr;
    },
    onRowEditCancel(event) {
      this.FormData.Entity[event.index] = { ...this.originalRows[event.index] };
    },

    async onCellEditModuleName(newValue, props) {
      //console.log("newValue=", newValue);
      if (!this.editingCellRows[props.index]) {
        this.editingCellRows[props.index] = { ...props.data };
      }
      this.editingCellRows[props.index][props.column.field] = newValue;

      const Forms = this.$data.modulesFormsArr.find(
        (r) => r.module == newValue
      );
      this.$data.formsArr = (Forms || {}).formsArr;
    },
    async onCellEdit(newValue, props) {
      if (!this.editingCellRows[props.index]) {
        this.editingCellRows[props.index] = { ...props.data };
      }
      this.editingCellRows[props.index][props.column.field] = newValue;
    },

    clickExit() {
      this.$router.push("/modules/userdocright/UserRightReestr");
    },
    getModuleName(module) {
      const Module = this.modulesArr.find((r) => r.module == module);
      return (Module || {}).Name;
    },
    getFormName(form, module) {
      const Forms = this.$data.modulesFormsArr.find((r) => r.module == module);
      const Form = ((Forms || {}).formsArr || []).find((r) => r.form == form);
      return (Form || {}).Name;
    },
    async clickSave() {
      this.$data.FormData.DocMovement.User_id = (
        this.$data.selectedUser || {}
      ).id;
      this.$data.FormData.DocMovement.User_Name = (
        this.$data.selectedUser || {}
      ).Name;
      this.$data.FormData.Entity.forEach((row) => {
        row.User_id = (this.$data.selectedUser || {}).id;
        row.User_Name = (this.$data.selectedUser || {}).Name;
      });
      const formData = {
        module: "userdocright",
        form: "UserRight",
        UserAuthID: localStorage.getItem("UserAuthID"),
        data: this.$data.FormData,
      };
      //console.log("formData=", formData.data);
      const answer = await this.$axios.$post("api", formData);
      if (answer.Error)
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      else
        this.$data.messages = [
          { severity: "success", content: "Документ сохранён" },
        ];
    },
  },
};
</script>