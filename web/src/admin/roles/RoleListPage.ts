import "#admin/roles/RoleForm";
import "#elements/buttons/SpinnerButton/ak-spinner-button";
import "#elements/forms/DeleteBulkForm";
import "#elements/forms/ModalForm";
import "@patternfly/elements/pf-tooltip/pf-tooltip.js";

import { DEFAULT_CONFIG } from "#common/api/config";

import { PaginatedResponse, TableColumn } from "#elements/table/Table";
import { TablePage } from "#elements/table/TablePage";

import { RbacApi, Role } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

@customElement("ak-role-list")
export class RoleListPage extends TablePage<Role> {
    checkbox = true;
    clearOnRefresh = true;
    searchEnabled(): boolean {
        return true;
    }
    pageTitle(): string {
        return msg("Roles");
    }
    pageDescription(): string {
        return msg("Manage roles which grant permissions to objects within authentik.");
    }
    pageIcon(): string {
        return "fa fa-lock";
    }

    @property()
    order = "name";

    async apiEndpoint(): Promise<PaginatedResponse<Role>> {
        return new RbacApi(DEFAULT_CONFIG).rbacRolesList(await this.defaultEndpointConfig());
    }

    columns(): TableColumn[] {
        return [new TableColumn(msg("Name"), "name"), new TableColumn(msg("Actions"))];
    }

    renderToolbarSelected(): TemplateResult {
        const disabled = this.selectedElements.length < 1;
        return html`<ak-forms-delete-bulk
            objectLabel=${msg("Role(s)")}
            .objects=${this.selectedElements}
            .usedBy=${(item: Role) => {
                return new RbacApi(DEFAULT_CONFIG).rbacRolesUsedByList({
                    uuid: item.pk,
                });
            }}
            .delete=${(item: Role) => {
                return new RbacApi(DEFAULT_CONFIG).rbacRolesDestroy({
                    uuid: item.pk,
                });
            }}
        >
            <button ?disabled=${disabled} slot="trigger" class="pf-c-button pf-m-danger">
                ${msg("Delete")}
            </button>
        </ak-forms-delete-bulk>`;
    }

    render(): TemplateResult {
        return html`<ak-page-header
                icon=${this.pageIcon()}
                header=${this.pageTitle()}
                description=${ifDefined(this.pageDescription())}
            >
            </ak-page-header>
            <section class="pf-c-page__main-section pf-m-no-padding-mobile">
                <div class="pf-c-card">${this.renderTable()}</div>
            </section>`;
    }

    row(item: Role): TemplateResult[] {
        return [
            html`<a href="#/identity/roles/${item.pk}">${item.name}</a>`,
            html`<ak-forms-modal>
                <span slot="submit"> ${msg("Update")} </span>
                <span slot="header"> ${msg("Update Role")} </span>
                <ak-role-form slot="form" .instancePk=${item.pk}> </ak-role-form>
                <button slot="trigger" class="pf-c-button pf-m-plain">
                    <pf-tooltip position="top" content=${msg("Edit")}>
                        <i class="fas fa-edit"></i>
                    </pf-tooltip>
                </button>
            </ak-forms-modal>`,
        ];
    }

    renderObjectCreate(): TemplateResult {
        return html`
            <ak-forms-modal>
                <span slot="submit"> ${msg("Create")} </span>
                <span slot="header"> ${msg("Create Role")} </span>
                <ak-role-form slot="form"> </ak-role-form>
                <button slot="trigger" class="pf-c-button pf-m-primary">${msg("Create")}</button>
            </ak-forms-modal>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-role-list": RoleListPage;
    }
}
