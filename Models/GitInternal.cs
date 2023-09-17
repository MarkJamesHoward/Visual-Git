namespace GitVisualiserAPI.Models;

public class GitInternal
{

    public string UserId {get;set;}

    public string Id {get;set;}

    public string? CommitNodes { get; set; }

    public string? BlobNodes { get; set; }

    public string? TreeNodes { get; set; }

    public string? BranchNodes { get; set; }

    public string? RemoteBranchNodes {get; set;}

    public string? HEADNodes { get; set; }

    public string? IndexFilesNodes { get; set; }

    public string? WorkingFilesNodes { get; set; }
}

