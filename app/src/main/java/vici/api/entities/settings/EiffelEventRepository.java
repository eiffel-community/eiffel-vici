package vici.api.entities.settings;


public class EiffelEventRepository {
    private String name;
    private String url;
    private RepositorySettings repositorySettings;

    public EiffelEventRepository() {
    }

    public EiffelEventRepository(String name, String url, RepositorySettings repositorySettings) {
        this.name = name;
        this.url = url;
        if (repositorySettings == null) {
            this.repositorySettings = new RepositorySettings();
        } else {
            this.repositorySettings = repositorySettings;
        }
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public RepositorySettings getRepositorySettings() {
        return repositorySettings;
    }

    public void setRepositorySettings(RepositorySettings repositorySettings) {
        this.repositorySettings = repositorySettings;
    }
}